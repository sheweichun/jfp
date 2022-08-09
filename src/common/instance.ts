import { IVnode } from "./element.type";






let currentVnode:IVnode = null

export function setCurrentVnode(n: IVnode){
    currentVnode = n
    if(n){
        n.hookCursor = 0  
    }
}

export function restoreVnode(n: IVnode){
    currentVnode = n
}

export function getCurrentVnode(){
    return currentVnode
}