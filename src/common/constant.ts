

export const TEXT_SYMBOL = '#text';

export const enum VnodeStatus {
    EMPTY = 0,
    UPDATE = 1 << 1,
    INSERT = 1 << 2,
    REMOVE = 1 << 3,
    DIRTY = 1 << 4,
}

export const enum VnodeTag{
    String = 1 << 1,
    FUNC = 1 << 2,
    SVG = 1 << 3,
    TEXT = 1 << 4
}

export const enum HookTypes{
    LIST = 'list',
    EFFECT = 'effect',
    LAYOUT = 'layout',
    STATE = 'state'
}
