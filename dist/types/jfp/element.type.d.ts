import { CSSProperty } from './css.type';
interface BaseProps {
    [key: string]: any;
}
export interface FElementProps extends BaseProps {
    key?: string;
    className?: string;
    ref?: IRef;
    style?: CSSProperty;
    children?: FElementChildren;
}
export interface IRef {
}
export interface IVnode {
    type: string;
    props: FElementProps;
    key?: string;
    ref?: IRef;
}
export declare type FElement = string | IVnode;
export declare type FElementChildren = FElement | FElement[];
export {};
