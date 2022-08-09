export declare const TEXT_SYMBOL = "#text";
export declare const enum VnodeStatus {
    EMPTY = 0,
    UPDATE = 2,
    INSERT = 4,
    REMOVE = 8,
    DIRTY = 16
}
export declare const enum VnodeTag {
    String = 2,
    FUNC = 4,
    SVG = 8,
    TEXT = 16
}
export declare const enum HookTypes {
    LIST = "list",
    EFFECT = "effect",
    LAYOUT = "layout",
    STATE = "state"
}
