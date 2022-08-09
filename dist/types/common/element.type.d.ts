import { CSSProperty } from './css.type';
import { HookTypes, VnodeStatus, VnodeTag } from './constant';
import { FC } from './component.type';
import { HookData } from './hook.type';
export interface FElementProps extends Record<string, any> {
    key?: string;
    className?: string;
    ref?: IRef;
    style?: CSSProperty;
    children?: FElementChildren;
}
export interface IRef {
}
export declare type IVnodeNode = HTMLElement | Text | DocumentFragment | SVGElement;
export interface IVnode {
    type: string | FC;
    tag: VnodeTag;
    props: FElementProps;
    newProps?: FElementProps;
    children?: IVnode[];
    newChildren?: IVnode[];
    hookCursor: number;
    hooks?: {
        [HookTypes.LIST]: HookData[];
        [HookTypes.EFFECT]: HookData[];
        [HookTypes.LAYOUT]: HookData[];
    };
    parent?: IVnode;
    key?: string;
    node?: IVnodeNode;
    status?: VnodeStatus;
    sibling?: IVnode;
    ref?: IRef;
    lastChild?: Element;
}
export declare type FElement = string | IVnode;
export declare type FElementChildren = FElement | FElement[];
