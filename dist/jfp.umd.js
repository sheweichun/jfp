(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.jfp = {}));
})(this, (function (exports) { 'use strict';

    const TEXT_SYMBOL = '#text';

    function toArray(obj) {
        return !obj ? [] : (isArr(obj) ? obj : [obj]);
    }
    const isFn = (x) => typeof x === 'function';
    const isStr = (s) => typeof s === 'string';
    const isNull = (x) => x == null;
    const isStrOrNum = (s) => typeof s === 'string' || typeof s === 'number';
    const isArr = Array.isArray;
    const isNothing = (x) => x == null || x === '';

    function flat(arr, target = []) {
        arr.forEach(v => {
            isArr(v)
                ? flat(v, target)
                : !isNull(v) && target.push(isStrOrNum(v) ? createTextVnode(v) : v);
        });
        return target;
    }
    function Fragment() {
    }
    function createElement(type, props, ...children) {
        props = props || {};
        const child = flat(toArray(props.children || children));
        const key = props.key || null;
        const ref = props.ref || null;
        if (key)
            props.key = undefined;
        if (ref)
            props.ref = undefined;
        return createVnode(type, props, key, ref, child);
    }
    function getType(type) {
        if (isStr(type)) {
            if (type === 'svg') {
                return 8;
            }
            return 2;
        }
        else if (isFn(type)) {
            return 4;
        }
    }
    function createVnode(type, props, key, ref, children) {
        return { type, tag: getType(type), props, key, ref, status: 0, children, hookCursor: 0 };
    }
    function createTextVnode(value) {
        return { type: TEXT_SYMBOL, tag: 16, props: { nodeValue: isNull(value) ? '' : value }, status: 0, hookCursor: 0 };
    }

    let currentVnode = null;
    function setCurrentVnode(n) {
        currentVnode = n;
        if (n) {
            n.hookCursor = 0;
        }
    }
    function restoreVnode(n) {
        currentVnode = n;
    }
    function getCurrentVnode() {
        return currentVnode;
    }

    function lcsVnodeCompare(a, b) {
        if (!isNothing(a.key) || !isNothing(b.key)) {
            return a.key === b.key && a.type === b.type;
        }
        return a.type === b.type;
    }
    function extractCommonArray(dp, a, b, i, j, indexMap = {}) {
        if (i === 0 || j === 0)
            return indexMap;
        const curAIndex = i - 1, curBIndex = j - 1;
        if (lcsVnodeCompare(a[curAIndex], b[curBIndex])) {
            a[curAIndex].status = 2;
            b[curBIndex].status = 2;
            indexMap[curBIndex] = curAIndex;
            return extractCommonArray(dp, a, b, curAIndex, curBIndex, indexMap);
        }
        else if (dp[i][curBIndex] > dp[curAIndex][j]) {
            return extractCommonArray(dp, a, b, i, curBIndex, indexMap);
        }
        return extractCommonArray(dp, a, b, curAIndex, j, indexMap);
    }
    function lcs(a, b) {
        const aLen = a.length, bLen = b.length;
        const dp = [Array(bLen + 1).fill(0)];
        for (let i = 1; i <= aLen; i++) {
            dp[i] = [0];
            const curA = a[i - 1];
            curA.status = 8;
            for (let j = 1; j <= bLen; j++) {
                const curB = b[j - 1];
                curB.status = 4;
                if (lcsVnodeCompare(curA, curB)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                }
                else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return extractCommonArray(dp, a, b, aLen, bLen);
    }

    function objectIter(props, oldProps, callback) {
        Object.keys(props).forEach((name) => {
            return callback(name, props[name], (oldProps || {})[name]);
        });
        props = props || {};
        oldProps = oldProps || {};
        Object.keys(oldProps).forEach(k => callback(k, props[k], oldProps[k]));
        Object.keys(props).forEach(k => !oldProps.hasOwnProperty(k) && callback(k, props[k], undefined));
    }
    function updateElementProps(dom, props, oldProps = {}) {
        objectIter(props, oldProps, (name, value, oldValue) => {
            if (value === oldValue || name === 'children') ;
            else if (name === 'style') {
                const domStyle = dom.style || {};
                objectIter(value, oldValue, (sName, sValue, oldSValue) => {
                    if (sValue !== oldSValue) {
                        domStyle[sName] = sValue;
                    }
                });
            }
            else if (name.indexOf('on') === 0) {
                const eventName = name.slice(2).toLowerCase();
                if (oldProps[name]) {
                    dom.removeEventListener(eventName, oldProps[name]);
                }
                dom.addEventListener(eventName, value);
            }
            else if (value == null || value === false) {
                dom.removeAttribute(name.replace(/[A-Z]/g, ($0) => { return '-' + $0.toLowerCase(); }));
            }
            else {
                dom.setAttribute(name.replace(/[A-Z]/g, ($0) => { return '-' + $0.toLowerCase(); }), value);
            }
        });
    }
    function createTextNode(vnode) {
        vnode.node = document.createTextNode(vnode.props.nodeValue);
    }
    function createHTMLNode(vnode) {
        const { type, tag, props, children } = vnode;
        const isSvg = tag & 8;
        const dom = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', type) : document.createElement(type);
        vnode.node = dom;
        updateElementProps(dom, props);
        if (children) {
            children.forEach((childVnode) => {
                childVnode.tag = isSvg ? 8 : childVnode.tag;
                updateVnode(childVnode);
                dom.appendChild(childVnode.node);
                childVnode.parent = vnode;
            });
        }
    }
    function createFCNode(vnode) {
        const { type, props, children } = vnode;
        vnode.node = document.createDocumentFragment();
        const subVnode = type(Object.assign({}, props, { children }));
        const childrenNode = toArray(subVnode);
        vnode.children = childrenNode;
        childrenNode.forEach((vnodeItem) => {
            updateVnode(vnodeItem);
            vnode.node.appendChild(vnodeItem.node);
            vnodeItem.parent = vnode;
        });
    }
    function updateFCNode(vnode) {
        const { type, newProps, children } = vnode;
        const subVnode = type(Object.assign({}, newProps, { children }));
        vnode.newChildren = toArray(subVnode);
        diffInChildren(vnode);
        commitVnode(vnode);
    }
    function mergeNewAndOldVnode(newVnode, oldVnode) {
        oldVnode.newChildren = newVnode.children;
        oldVnode.newProps = newVnode.props;
        oldVnode.ref = newVnode.ref;
        oldVnode.key = newVnode.key;
        return oldVnode;
    }
    function commitVnode(vnode) {
        vnode.props = vnode.newProps;
        vnode.newProps = {};
        vnode.children = vnode.newChildren;
        vnode.newChildren = [];
    }
    function updateHTMLNode(vnode) {
        const { props, node, newProps } = vnode;
        updateElementProps(node, newProps, props);
        diffInChildren(vnode);
        commitVnode(vnode);
    }
    function updateTextNode(vnode) {
        vnode.node.textContent = vnode.newProps.nodeValue;
        commitVnode(vnode);
    }
    function createRealNode(vnode) {
        const { type, tag } = vnode;
        if (type === TEXT_SYMBOL) {
            createTextNode(vnode);
        }
        else if (tag & 2 || tag & 8) {
            createHTMLNode(vnode);
        }
        else if (tag & 4) {
            createFCNode(vnode);
        }
    }
    function updateRealNode(vnode) {
        const { type, tag } = vnode;
        if (type === TEXT_SYMBOL) {
            updateTextNode(vnode);
        }
        else if (tag & 2 || tag & 8) {
            updateHTMLNode(vnode);
        }
        else if (tag & 4) {
            updateFCNode(vnode);
        }
    }
    function getParentNode(vnode) {
        if (vnode.tag & 4 && vnode.parent) {
            return getParentNode(vnode.parent);
        }
        return vnode.node;
    }
    function getPrevNode(vnode, index, children) {
        if (index < 0 || vnode == null)
            return null;
        if (vnode.tag & 4) {
            const vnodeChild = vnode.children;
            if (vnodeChild && vnodeChild.length > 0) {
                const targetIndex = vnodeChild.length - 1;
                const target = vnodeChild[targetIndex];
                return getPrevNode(target, targetIndex, vnodeChild);
            }
            else {
                if (index <= 0)
                    return null;
                const newIndex = index - 1;
                return getPrevNode(children[newIndex], newIndex, children);
            }
        }
        return vnode.node;
    }
    function getSiblingNode(curIndex, newChildren, parentNode) {
        const isLast = curIndex === newChildren.length - 1;
        if (isLast) {
            return;
        }
        else {
            const prevNode = getPrevNode(newChildren[curIndex - 1], curIndex - 1, newChildren);
            if (prevNode == null) {
                return getParentNode(parentNode).firstChild;
            }
            else {
                return prevNode.nextSibling;
            }
        }
    }
    function removeNode(parentNode, child) {
        if (child.tag & 4) {
            if (child.children) {
                child.children.forEach((subChild) => {
                    removeNode(parentNode, subChild);
                });
            }
        }
        else {
            child.node && parentNode.removeChild(child.node);
        }
    }
    function diffInChildren(vnode) {
        const { children, newChildren, tag } = vnode;
        const indexMap = lcs(children, newChildren);
        children.forEach((child) => {
            if (child.status & 8) {
                updateVnode(child);
            }
        });
        newChildren.forEach((newChildVnode, cIndex) => {
            if (newChildVnode.status & 2) {
                const oldChild = children[indexMap[cIndex]];
                if (oldChild) {
                    const updateOldChild = mergeNewAndOldVnode(newChildVnode, oldChild);
                    newChildren[cIndex] = updateOldChild;
                    updateVnode(updateOldChild);
                }
                newChildVnode.status = 0;
                return;
            }
            else {
                const isSvg = tag & 8;
                newChildVnode.tag = isSvg ? 8 : newChildVnode.tag;
                updateVnode(newChildVnode);
                newChildVnode.parent = vnode;
                const siblingNode = getSiblingNode(cIndex, newChildren, vnode);
                if (siblingNode == null) {
                    getParentNode(vnode).appendChild(newChildVnode.node);
                }
                else {
                    getParentNode(vnode).insertBefore(newChildVnode.node, siblingNode);
                }
            }
        });
    }
    function doSideEffect(effects) {
        if (!effects || effects.length === 0)
            return;
        effects.forEach(e => e.data[2] && e.data[2]());
        effects.forEach(e => (e.data[2] = e.data[0]()));
        effects.splice(0, effects.length);
    }
    function doClearEffect(list) {
        if (!list || list.length === 0)
            return;
        list.forEach((curHook) => {
            if (curHook.type === "effect") {
                const { data } = curHook;
                (data && data[2]) && (data[2]());
            }
        });
    }
    function updateVnode(vnode) {
        if (vnode == null)
            return;
        const preVNode = getCurrentVnode();
        setCurrentVnode(vnode);
        if (!vnode.node) {
            createRealNode(vnode);
        }
        else {
            if (vnode.status & 8) {
                removeNode(getParentNode(vnode.parent), vnode);
                vnode.status = 0;
                vnode.hooks && doClearEffect(vnode.hooks.list);
                return;
            }
            else {
                updateRealNode(vnode);
            }
        }
        vnode.hooks && doSideEffect(vnode.hooks.effect);
        restoreVnode(preVNode);
    }
    function render(vnode, element) {
        if (!vnode || !element)
            return;
        updateVnode(vnode);
        element.appendChild(vnode.node);
        vnode.node = element;
    }

    function useState(initState) {
        return useReducer(null, initState);
    }
    function useReducer(reducer, initialValue) {
        const [hook, curVnode] = getHook();
        const hookData = hook.data;
        if (hookData.length === 0) {
            if (isFn(initialValue)) {
                initialValue = initialValue();
            }
            hookData[0] = initialValue;
            hookData[1] = (value) => {
                hookData[0] = reducer
                    ? reducer(initialValue, value)
                    : isFn(value)
                        ? value(initialValue)
                        : value;
                updateVnode(curVnode);
            };
            hook.type = "state";
        }
        return [hookData[0], hookData[1]];
    }
    function isChanged(a, b) {
        return !a || a.length !== b.length || b.some((arg, index) => !Object.is(arg, a[index]));
    }
    function useEffect(cb, deps) {
        return effectImpl(cb, deps, "effect");
    }
    function useMemo(cb, deps) {
        const [hook] = getHook();
        const { data } = hook;
        if (isChanged(data[1], deps)) {
            data[0] = cb();
            data[1] = deps;
        }
        return data[0];
    }
    function useCallback(cb, deps) {
        const [hook] = getHook();
        const { data } = hook;
        if (isChanged(data[1], deps)) {
            data[0] = cb;
            data[1] = deps;
        }
        return data[0];
    }
    function effectImpl(cb, deps, key) {
        const [hook, current] = getHook();
        const hookData = hook.data;
        if (isChanged(hookData[1], deps)) {
            hookData[0] = cb;
            hookData[1] = deps;
            hook.type = key;
            current.hooks[key].push(hook);
        }
    }
    function getHook() {
        const curVnode = getCurrentVnode();
        const cursor = curVnode.hookCursor++;
        const hooks = curVnode.hooks || (curVnode.hooks = {
            ["list"]: [],
            ["effect"]: [],
            ["layout"]: []
        });
        if (cursor >= hooks.list.length) {
            hooks.list.push({ data: [] });
        }
        return [hooks.list[cursor], curVnode];
    }

    const j = createElement;

    exports.Fragment = Fragment;
    exports.j = j;
    exports.render = render;
    exports.updateRealNode = updateRealNode;
    exports.updateVnode = updateVnode;
    exports.useCallback = useCallback;
    exports.useEffect = useEffect;
    exports.useMemo = useMemo;
    exports.useState = useState;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=jfp.umd.js.map
