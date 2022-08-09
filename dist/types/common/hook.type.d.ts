import { HookTypes } from './constant';
export declare type Reducer<T, U> = (prevState: T, action: U) => T;
export declare type SetStateAction<S> = ((prevState: S) => S);
export declare type Dispatch<T> = (value: T, resume?: boolean) => void;
export declare type HookData<T = any, U = any, S = any> = {
    type?: HookTypes;
    data: [T?, U?, S?];
};
export declare type EffectCallback = () => void | (() => void | undefined);
export declare type DependencyList<T = any> = Array<T>;
