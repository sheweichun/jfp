import { Dispatch, EffectCallback, DependencyList } from '../common/hook.type';
export declare function useState<T>(initState: T): [T, Dispatch<T>];
export declare function useEffect(cb: EffectCallback, deps?: DependencyList): void;
