import { FElement, FElementProps, IVnode } from '../common/element.type';
import { FC } from '../common/component.type';
export declare function flat(arr: FElement[], target?: IVnode[]): IVnode[];
export declare function Fragment(): void;
export declare function createElement(type: string | FC, props: FElementProps, ...children: FElement[]): IVnode;
