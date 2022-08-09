import { IVnode } from '../common/element.type'
import { Reducer, Dispatch, HookData, SetStateAction, EffectCallback, DependencyList } from '../common/hook.type'
import { HookTypes } from '../common/constant'
import { getCurrentVnode } from '../common/instance'
import { updateVnode } from '../dom/render'
import { isFn } from '../utils'


export function useState<T>(initState: T): [T, Dispatch<T>]{
    return useReducer(null, initState)
}

function useReducer<T, U>(reducer: Reducer<T, U>, initialValue?: T): [T, Dispatch<T>]{
    const [hook, curVnode] = getHook<T, Dispatch<T>>()
    const hookData = hook.data
    if (hookData.length === 0) {
      if(isFn(initialValue)){
        initialValue = initialValue()
      }
      hookData[0] = initialValue
      hookData[1] = (value: T | SetStateAction<T>) => {
        hookData[0] = reducer
          ? reducer(initialValue, value as any)
          : isFn(value)
            ? value(initialValue)
            : value
        updateVnode(curVnode)
      }
      hook.type = HookTypes.STATE
    }
    return [hookData[0], hookData[1]];
}

function isChanged<T>(a: DependencyList<T>, b: DependencyList<T>){
  return !a || a.length !== b.length || b.some((arg, index) => !Object.is(arg, a[index]))
}


export function useEffect(cb: EffectCallback, deps?: DependencyList): void{
  return effectImpl(cb, deps!, HookTypes.EFFECT)
}

function effectImpl<T = any>(
  cb: EffectCallback,
  deps: DependencyList<T>,
  key: HookTypes
){
  const [hook, current] = getHook<EffectCallback, DependencyList<T>>()
  const hookData = hook.data
  if (isChanged(hookData[1], deps)) {
    hookData[0] = cb
    hookData[1] = deps
    hook.type = key
    current.hooks[key].push(hook)
  }
}

// export function doSideEffect<T = any>(effects:HookData<EffectCallback, DependencyList<T>>[]){
//   effects.forEach(e => e[2] && e[2]()) //执行销毁函数
//   effects.forEach(e => (e[2] = e[0]())) //返回值为销毁函数
//   effects.splice(0, effects.length - 1);
// }






function getHook<T, U>(): [HookData<T, U>, IVnode]{
    const curVnode = getCurrentVnode()
    const cursor = curVnode.hookCursor++;
    const hooks = curVnode.hooks || (curVnode.hooks = { 
      [HookTypes.LIST]: [],
      [HookTypes.EFFECT]: [],
      [HookTypes.LAYOUT]: []
    })
    if(cursor >= hooks.list.length){
        hooks.list.push({ data: []} )
    }
    return [hooks.list[cursor], curVnode]
}
