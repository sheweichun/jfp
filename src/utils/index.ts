
export function toArray(obj:any){
    return !obj ? [] : (isArr(obj) ? obj : [obj])
}



export const isFn = (x: any): x is Function => typeof x === 'function'
export const isStr = (s: any): boolean => typeof s === 'string'
export const isNull = (x: any) => x == null

export const isStrOrNum = (s: any): boolean => typeof s === 'string' || typeof s === 'number'

export const isArr = Array.isArray

export const isNothing = (x: any) => x == null || x === ''