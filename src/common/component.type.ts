import { IVnode, FElementProps } from './element.type'

export interface FC<P extends FElementProps = {}> {
    (props: P): IVnode | IVnode | null
}