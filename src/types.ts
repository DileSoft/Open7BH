export interface ItemType {
    type: string;
    value?: number;
    tag?: string;
}

export interface CellType {
    item?: ItemType;
    type: string;
}

export interface LevelType {
    cells: {[key: string]: CellType};
    task: string;
    characters: CharacterType[];
    code: LineType[];
    win: (cells: {[key: string]: CellType}, characters: CharacterType[]) => boolean;
    width: number;
    height: number;
}

export interface CharacterType {
    coordinates: string;
    color: string;
    name: string;
    item?: ItemType;
    step: number;
    terminated?: boolean;
}

export type DirectionType = ('left'|'right'|'top'|'bottom'|'top-left'|'top-right'|'bottom-left'|'bottom-right');
export type DirectionTypeWithHere = DirectionType | 'here';

export interface LineStepType {
    type: 'step';
    directions: DirectionType[];
}

export interface LineGotoType {
    type: 'goto';
    step: number;
}

export interface LineIfType {
    type: 'if'
    conditions: [{
        value1: DirectionTypeWithHere;
        operation: '==' | '!=' | '>' | '<' | '>=' | '<=';
        value2: number;
    }];
}

export interface LinePickupType {
    type: 'pickup';
}

export interface LineDropType {
    type: 'drop';
}

export interface LineEndifType {
    type: 'endif';
}

export type LineType = LineStepType | LineGotoType | LineIfType | LinePickupType |LineDropType | LineEndifType;
