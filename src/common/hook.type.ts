import { IVnode } from '../common/element.type'
import { HookTypes } from './constant'
export type Reducer<T, U> = (prevState: T, action: U) => T
export type SetStateAction<S> = ((prevState: S) => S)

export type Dispatch<T> = (value: T , resume?: boolean) => void

// export type HookData<T = any, U = any, S = any, R = boolean> = [ T?, U?, S?, R? ]
export type HookData<T = any, U = any, S = any> = {
    type?: HookTypes
    data: [ T?, U?, S? ]
}

export type EffectCallback = () => void | (() => void | undefined)


export type DependencyList<T = any> = Array<T>


// function getCurrentHook<S = Function, T = any>(cursor: number): {hook: HookData, vnode: IVnode}{

// }