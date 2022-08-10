import { Dispatch, EffectCallback, DependencyList } from '../common/hook.type';
export declare function useState<T>(initState: T): [T, Dispatch<T>];
export declare function useEffect(cb: EffectCallback, deps?: DependencyList): void;
export declare function useMemo<T = any>(cb: () => T, deps: DependencyList): T;
export declare function useCallback<T = Function>(cb: T, deps: DependencyList): T;
