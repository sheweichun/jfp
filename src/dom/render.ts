import {IVnode, FElementProps, IVnodeNode} from '../common/element.type'
import {HookTypes, TEXT_SYMBOL, VnodeStatus, VnodeTag} from '../common/constant'
import {FC} from '../common/component.type'
import {  EffectCallback, DependencyList, HookData } from '../common/hook.type'
import { getCurrentVnode, restoreVnode, setCurrentVnode } from '../common/instance'
import { lcs } from './reconcile'
import { isArr, toArray } from '../utils'




function objectIter<T>(props:T, oldProps: T | undefined,callback: (name: string, value: T[keyof T], oldValue: T[keyof T]) => void){
    Object.keys(props).forEach((name)=>{
        return callback(name, props[name], (oldProps || {} as T)[name])
    })
    props = props || {} as T
    oldProps = oldProps || {} as T
    Object.keys(oldProps).forEach(k => callback(k, props[k], oldProps[k])) 
    Object.keys(props).forEach(k => !oldProps.hasOwnProperty(k) && callback(k, props[k], undefined)) 
}


function updateElementProps(dom:Element, props:FElementProps, oldProps:FElementProps = {}){
    objectIter(props, oldProps, (name, value, oldValue)=>{
        if(value === oldValue || name === 'children'){
            
        }else if(name === 'style'){
            // const styleArr:string[] = []
            const domStyle = (dom as HTMLElement).style || {}
            objectIter(value, oldValue, (sName, sValue, oldSValue)=>{
                if (sValue !== oldSValue) {
                    domStyle[sName] = sValue
                } 
            })
        } else if(name.indexOf('on') === 0){
            const eventName = name.slice(2).toLowerCase()
            if(oldProps[name]){
                dom.removeEventListener(eventName, oldProps[name])
            }
            dom.addEventListener(eventName, value)
        } else if (value == null || value === false){
            dom.removeAttribute(name.replace(/[A-Z]/g, ($0)=>{return '-'+$0.toLowerCase()}))
        } else {
            dom.setAttribute(name.replace(/[A-Z]/g, ($0)=>{return '-'+$0.toLowerCase()}), value)
        }
    })
}

function createTextNode(vnode:IVnode){
    vnode.node = document.createTextNode(vnode.props.nodeValue)
}


function createHTMLNode(vnode:IVnode){
    const { type, tag, props, children } = vnode
    const isSvg = tag & VnodeTag.SVG
    const dom = isSvg ? document.createElementNS(
        'http://www.w3.org/2000/svg',
        type as string
    ) : document.createElement(type as string);
    vnode.node = dom
    updateElementProps(dom, props)
    if(children){
        children.forEach((childVnode)=>{
            // console.log('children :', children, childVnode);
            childVnode.tag = isSvg ? VnodeTag.SVG : childVnode.tag
            updateVnode(childVnode)
            dom.appendChild(childVnode.node);
            childVnode.parent = vnode
        })
    }
}



function createFCNode(vnode:IVnode){
    const { type, props, children } = vnode
    vnode.node = document.createDocumentFragment()
    const subVnode = (type as FC)(Object.assign({}, props, {children}))
    const childrenNode = toArray(subVnode)
    vnode.children = childrenNode
    childrenNode.forEach((vnodeItem)=>{
        updateVnode(vnodeItem)
        vnode.node.appendChild(vnodeItem.node)
        vnodeItem.parent = vnode
    })
}

function updateFCNode(vnode:IVnode){
    const { type, newProps,  children } = vnode
    const subVnode = (type as FC)(Object.assign({}, newProps, {children}))
    vnode.newChildren = toArray(subVnode)
    // console.log('newChildren :', vnode.newChildren);
    diffInChildren(vnode)
    commitVnode(vnode)
}

function mergeNewAndOldVnode(newVnode:IVnode, oldVnode:IVnode){

    oldVnode.newChildren = newVnode.children
    oldVnode.newProps = newVnode.props
    oldVnode.ref = newVnode.ref
    oldVnode.key = newVnode.key
    return oldVnode
}

function commitVnode(vnode:IVnode){
    vnode.props = vnode.newProps
    vnode.newProps = {}
    vnode.children = vnode.newChildren
    vnode.newChildren = []
}

function updateHTMLNode(vnode:IVnode){
    const { props, node, newProps } = vnode
    updateElementProps(node as Element, newProps, props)
    // if(children){
    //     children.forEach((childVnode, cIndex)=>{
    //         const newChildVnode = newChildren[cIndex]
    //         mergeNewAndOldVnode(newChildVnode, childVnode)
    //         updateVnode(newChildVnode)
    //     })
    // }
    diffInChildren(vnode)
    commitVnode(vnode)
}

function updateTextNode(vnode:IVnode){
    vnode.node.textContent = vnode.newProps.nodeValue
    commitVnode(vnode)
}

function createRealNode(vnode:IVnode){
    const { type, tag } = vnode
    if(type === TEXT_SYMBOL){
        createTextNode(vnode)
    }else if(tag & VnodeTag.String || tag & VnodeTag.SVG){
        createHTMLNode(vnode)
    }else if(tag & VnodeTag.FUNC){
        createFCNode(vnode)
    }
}


export function updateRealNode(vnode:IVnode){
    const { type, tag } = vnode
    if(type === TEXT_SYMBOL){
        updateTextNode(vnode)
    }else if(tag & VnodeTag.String || tag & VnodeTag.SVG){
        updateHTMLNode(vnode)
    }else if(tag & VnodeTag.FUNC){
        // if(!vnode.parent){
        //     console.log('vnode :',vnode)
        // }
        updateFCNode(vnode)
    }
}

function getParentNode(vnode:IVnode): Element{
    if(vnode.tag & VnodeTag.FUNC && vnode.parent){
        return getParentNode(vnode.parent)
    }
    return vnode.node as Element
}

function getPrevNode(vnode:IVnode, index:number, children:IVnode[]){
    if(index < 0 || vnode == null) return null
    if(vnode.tag & VnodeTag.FUNC){
        const vnodeChild = vnode.children
        if(vnodeChild && vnodeChild.length > 0){
            const targetIndex = vnodeChild.length - 1
            const target = vnodeChild[targetIndex]
            return getPrevNode(target, targetIndex , vnodeChild)
        }else{
            if(index <= 0) return null
            const newIndex = index - 1
            return getPrevNode(children[newIndex], newIndex, children)
        }
    }
    return vnode.node
}

function getSiblingNode(curIndex:number, newChildren:IVnode[], parentNode:IVnode){
    const isLast = curIndex === newChildren.length - 1
    if(isLast){
        return
    }else{
        const prevNode = getPrevNode(newChildren[curIndex - 1], curIndex - 1, newChildren)
        if(prevNode == null){
            return getParentNode(parentNode).firstChild
        }else{
            return prevNode.nextSibling
        }
    }
} 

function removeNode(parentNode:Element, child:IVnode){
    if(child.tag & VnodeTag.FUNC){
        if(child.children){
            child.children.forEach((subChild)=>{
                removeNode(parentNode, subChild)
            })
        }
    }else{
        child.node && parentNode.removeChild(child.node)
    }
}

function diffInChildren(vnode:IVnode){
    const { children , newChildren, tag } = vnode
    const indexMap = lcs(children, newChildren)
    children.forEach((child)=>{
        if(child.status & VnodeStatus.REMOVE){
            updateVnode(child)
        }
    })
    newChildren.forEach((newChildVnode, cIndex)=>{
        if(newChildVnode.status & VnodeStatus.UPDATE){
            // console.log('indexMap oldChild :', indexMap);
            const oldChild = children[indexMap[cIndex]];
            if(oldChild){ //todo 理论上oldChild必定存在
                const updateOldChild = mergeNewAndOldVnode(newChildVnode, oldChild)
                newChildren[cIndex] = updateOldChild //复用oldChild
                updateVnode(updateOldChild)
            }
            newChildVnode.status = VnodeStatus.EMPTY
            return 
        }else{
            const isSvg = tag & VnodeTag.SVG;
            newChildVnode.tag = isSvg ? VnodeTag.SVG : newChildVnode.tag;
            updateVnode(newChildVnode);
            newChildVnode.parent = vnode;
            const siblingNode = getSiblingNode(cIndex, newChildren, vnode);
            if(siblingNode == null){
                getParentNode(vnode).appendChild(newChildVnode.node)
            }else{
                getParentNode(vnode).insertBefore(newChildVnode.node, siblingNode)
            }
        }
    }) 
}

function doSideEffect<T = any>(effects:HookData<EffectCallback, DependencyList<T>>[]){
    if(!effects || effects.length === 0) return
    effects.forEach(e => e.data[2] && e.data[2]()) //执行销毁函数
    effects.forEach(e => (e.data[2] = e.data[0]())) //返回值为销毁函数
    effects.splice(0, effects.length);
}

function doClearEffect<T = any>(list:HookData<EffectCallback, DependencyList<T>>[]){
    if(!list || list.length === 0) return
    list.forEach((curHook)=>{
        if(curHook.type === HookTypes.EFFECT){
            const { data } = curHook;
            (data && data[2]) && (data[2]())
        }
    })
}
  

export function updateVnode(vnode:IVnode){ 
   if(vnode == null) return
    const preVNode = getCurrentVnode()
    setCurrentVnode(vnode)
    if(!vnode.node){
        createRealNode(vnode)
        // vnode.hooks && doSideEffect(vnode.hooks.effect);
    }else{
        if(vnode.status & VnodeStatus.REMOVE){
            removeNode(getParentNode(vnode.parent), vnode)
            vnode.status = VnodeStatus.EMPTY
            vnode.hooks && doClearEffect(vnode.hooks.list)
            // vnode.hooks && doSideEffect(vnode.hooks.effect);  //todo 因为上次渲染被情况了 本次未执行 所有无effect
            return 
        }else{
            updateRealNode(vnode)
            // vnode.hooks && doSideEffect(vnode.hooks.effect);
        }
    }
    vnode.hooks && doSideEffect(vnode.hooks.effect);
    restoreVnode(preVNode);
}


export function render(vnode:IVnode, element:HTMLElement){
    if(!vnode || !element) return
    updateVnode(vnode)
    // console.log('vnode :', vnode);
    // vnode.node 
    element.appendChild(vnode.node);
    vnode.node = element
}