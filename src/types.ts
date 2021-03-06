import React from 'react';

export interface ItemType {
    type: 'box';
    value?: number;
    tag?: string;
    isRandom?: boolean;
}

export type CellTypeType = 'empty'|'hole'|'wall'|'printer'|'shredder'|'nothing';

export interface CellType {
    item?: ItemType;
    type: CellTypeType;
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
    slots?: [number];
    wait?: string;
}

export type DirectionType = ('left'|'right'|'top'|'bottom'|'top-left'|'top-right'|'bottom-left'|'bottom-right');
export type DirectionTypeWithHere = DirectionType | 'here';

export interface LineAbstractType {
    type: string;
    id?: string;
}

export interface StepDirection {
    type: 'direction';
    directions: DirectionType[];
}

export interface StepSlot {
    type: 'slot';
    slot: number;
}

export interface LineStepType extends LineAbstractType {
    type: 'step';
    destination: StepDirection | StepSlot;
}

export interface LineGiveType extends LineAbstractType {
    type: 'give';
    direction: ValueDirectionType | ValueSlotType;
}

export interface LineTakeType extends LineAbstractType {
    type: 'take';
    direction: ValueDirectionType | ValueSlotType;
}

export interface LineGotoType extends LineAbstractType {
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

export interface ValueSomethingType {
    type: 'something';
}

export interface ValueEmptyType {
    type: 'empty';
}

export interface ValueHoleType {
    type: 'hole';
}

export interface ValueCharacterType {
    type: 'character';
}

export interface ValueBoxType {
    type: 'box';
}

export interface ValuePrinterType {
    type: 'printer';
}

export interface ValueShredderType {
    type: 'shredder';
}

export interface ValueAllType {
    type: 'all';
}

export interface ValueSlotType {
    type: 'slot';
    slot: number;
}

export type IfOperationType = '==' | '!=' | '>' | '<' | '>=' | '<=';

export interface LineIfType extends LineAbstractType {
    type: 'if';
    id: string;
    conditions: [{
        value1: ValueDirectionType | ValueMyItemType | ValueSlotType;
        operation: IfOperationType;
        value2: ValueNumberType | ValueMyItemType | ValueDirectionType | ValueSlotType |
         ValueHoleType | ValueSomethingType | ValueEmptyType | ValueCharacterType | ValueBoxType |
         ValuePrinterType | ValueShredderType;
        logic: 'AND' | 'OR';
    }];
}

export interface LinePickupType extends LineAbstractType {
    type: 'pickup';
}

export interface LineDropType extends LineAbstractType {
    type: 'drop';
}

export interface LineEndifType extends LineAbstractType {
    type: 'endif';
    ifId: string;
}

export interface LineSayType extends LineAbstractType {
    type: 'say';
    text: string;
    target: ValueDirectionType | ValueSlotType | ValueAllType;
}

export interface LineHearType extends LineAbstractType {
    type: 'hear';
    text: string;
}

export interface LineVariableType extends LineAbstractType {
    type: 'variable';
    slot: number;
    value: ValueDirectionType | ValueSlotType | ValueMyItemType | ValueNumberType;
}

export interface LineCalcType extends LineAbstractType {
    type: 'calc';
    slot: number;
    value1: ValueDirectionType | ValueSlotType | ValueMyItemType | ValueNumberType;
    value2: ValueDirectionType | ValueSlotType | ValueMyItemType | ValueNumberType;
    operation: '+' | '-' | '/' | '*';
}

export interface LineNearType extends LineAbstractType {
    type: 'near'
    slot: number;
    find: 'box' | 'wall' | 'hole' | 'character' | 'printer' | 'shredder';
}

export interface LineForEachType extends LineAbstractType {
    type: 'foreach';
    directions: DirectionType[];
    slot: number;
    id: string;
}

export interface LineEndforeachType extends LineAbstractType {
    type: 'endforeach';
    foreachId: string;
}

export type LineType = LineStepType | LineGotoType | LineIfType | LinePickupType
| LineDropType | LineEndifType | LineGiveType | LineTakeType
| LineSayType | LineHearType | LineNearType | LineVariableType | LineForEachType | LineEndforeachType;

export type RenderLineType<T, > = (line: T, lineNumber: number, code: T[], setCode: React.Dispatch<React.SetStateAction<T[]>>) => React.ReactNode
