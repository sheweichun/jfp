
import { FElementChildren, FElement, FElementProps, IRef, IVnode } from '../common/element.type'
import { FC } from '../common/component.type'
import { VnodeStatus, TEXT_SYMBOL, VnodeTag } from '../common/constant'
import { isArr, isFn, isNull, isStrOrNum, isStr, toArray } from '../utils/index'

export function flat(arr: FElement [],target:IVnode[] = []){
    arr.forEach(v => {
      isArr(v)
        ? flat(v, target)
        : !isNull(v) && target.push(isStrOrNum(v) ? createTextVnode(v as string) : v as IVnode)
    })
    return target
}


export function Fragment(){

}



export function createElement(type:string | FC, props: FElementProps, ...children:FElement[]){
    props = props || {}
    const child:IVnode[] = flat(toArray(props.children || children))
    // let child:FElement[];
    // if (kids.length){
    //     child = kids.length === 1 ? kids[0] : kids
    // }
  
    const key = props.key || null
    const ref = props.ref || null
  
    if (key) props.key = undefined
    if (ref) props.ref = undefined
  
    return createVnode(type, props, key, ref, child)
}

function getType(type: string | FC){
    if(isStr(type)){
        if(type === 'svg'){
            return VnodeTag.SVG
        }
        return VnodeTag.String
    }else if(isFn(type)){
        return VnodeTag.FUNC
    }
}

function createVnode(type:string | FC, props: FElementProps, key:string, ref:IRef, children: IVnode[]):IVnode{
    return { type, tag: getType(type), props, key, ref, status: VnodeStatus.EMPTY, children, hookCursor:0 }
}

function createTextVnode(value: string){
    return { type: TEXT_SYMBOL, tag: VnodeTag.TEXT, props: { nodeValue: isNull(value) ? '' : value }, status: VnodeStatus.EMPTY, hookCursor:0 }
}


