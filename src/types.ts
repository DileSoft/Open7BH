export interface ItemType {
    type: 'box';
    value?: number;
    tag?: string;
    isRandom?: boolean;
}

export interface CellType {
    item?: ItemType;
    type: 'empty'|'hole'|'wall'|'printer'|'shredder';
    printed?: number;
    shredded?: number;
}

export type CellsType = {[key: string]: CellType};

export interface LevelType {
    cells: CellsType;
    task: string;
    characters: CharacterType[];
    code: LineType[];
    win: (cells: {[key: string]: CellType}, characters: CharacterType[]) => boolean;
    width: number;
    height: number;
}

/**
 * 1x1
 */
export type CoordinatesType = string;

export type CoordinatesArrayType = number[];

export interface CharacterType {
    coordinates: CoordinatesType;
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

export interface LineGiveType {
    type: 'give';
    direction: DirectionType;
}

export interface LineTakeType {
    type: 'take';
    direction: DirectionType;
}

export interface LineGotoType {
    type: 'goto';
    step: number;
}

export interface ValueDirectionType {
    type: 'direction';
    value: DirectionTypeWithHere;
}

export interface ValueNumberType {
    type: 'number';
    value: number;
}

export interface ValueMyItemType {
    type: 'myitem';
}

export type IfOperationType = '==' | '!=' | '>' | '<' | '>=' | '<=';

export interface LineIfType {
    type: 'if'
    conditions: [{
        value1: ValueDirectionType;
        operation: IfOperationType;
        value2: ValueNumberType | ValueMyItemType;
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

export interface LineSayType {
    type: 'say';
    text: string;
    direction: DirectionType;
}

export interface LineHearType {
    type: 'hear';
    text: string;
}

export interface LineVariableType {
    type: 'variable';
    slot: number;
}

export interface LineCalcType {
    type: 'calc';
    slot: number;
    value1: number;
    value2: number;
    operation: '+' | '-' | '/' | '*';
}

export interface LineNearType {
    type: 'near'
    slot: number;
    find: 'box' | 'empty' | 'hole' | 'character';
}

export interface LineForEachType {
    type: 'foreach';
    directions: DirectionType[];
    slot: number;
}

export type LineType = LineStepType | LineGotoType | LineIfType | LinePickupType |LineDropType | LineEndifType | LineGiveType | LineTakeType;
