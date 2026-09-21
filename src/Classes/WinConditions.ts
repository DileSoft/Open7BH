import type Level from './Level';
import type Cell from './Cell';
import { CellType } from './Cell';
import type Box from './Box';
import Shredder from './Shredder';

export type WinOperator = 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le';

export type NeighborDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Where the "box value" is taken from:
 *  - 'cell'      — the box lying on the cell
 *  - 'character' — the box held by the character standing on the cell
 */
export type WinValueSource = 'cell' | 'character';

export type WinCondition =
    | { kind: 'noBoxes' }
    | { kind: 'boxCount'; operator: WinOperator; value: number }
    | { kind: 'cellsHaveItems'; coordinates: [number, number][] }
    | { kind: 'cellsEmpty'; coordinates: [number, number][] }
    | { kind: 'tagPresent'; tag: string }
    | { kind: 'tagAbsent'; tag: string }
    | { kind: 'characterAt'; coordinates: [number, number] }
    | { kind: 'shredded'; coordinates: [number, number]; operator: WinOperator; value: number }
    | { kind: 'sortedByItemValue'; coordinates: [number, number][]; ascending: boolean; source?: WinValueSource }
    | { kind: 'neighborCompare'; coordinates: [number, number]; direction: NeighborDirection; operator: WinOperator; source?: WinValueSource }
    | { kind: 'code'; code: string };

export interface WinConditionsList {
    mode: 'all' | 'any';
    conditions: WinCondition[];
}

export const DEFAULT_WIN_CONDITIONS: WinConditionsList = {
    mode: 'all',
    conditions: [],
};

export const WIN_CONDITION_KINDS: WinCondition['kind'][] = [
    'noBoxes',
    'boxCount',
    'cellsHaveItems',
    'cellsEmpty',
    'tagPresent',
    'tagAbsent',
    'characterAt',
    'shredded',
    'sortedByItemValue',
    'neighborCompare',
    'code',
];

export function defaultCondition(kind: WinCondition['kind']): WinCondition {
    switch (kind) {
        case 'noBoxes':
            return { kind: 'noBoxes' };
        case 'boxCount':
            return { kind: 'boxCount', operator: 'ge', value: 0 };
        case 'cellsHaveItems':
            return { kind: 'cellsHaveItems', coordinates: [[0, 0]] };
        case 'cellsEmpty':
            return { kind: 'cellsEmpty', coordinates: [[0, 0]] };
        case 'tagPresent':
            return { kind: 'tagPresent', tag: '' };
        case 'tagAbsent':
            return { kind: 'tagAbsent', tag: '' };
        case 'characterAt':
            return { kind: 'characterAt', coordinates: [0, 0] };
        case 'shredded':
            return { kind: 'shredded', coordinates: [0, 0], operator: 'ge', value: 1 };
        case 'sortedByItemValue':
            return { kind: 'sortedByItemValue', coordinates: [[0, 0], [1, 0]], ascending: true, source: 'cell' };
        case 'neighborCompare':
            return { kind: 'neighborCompare', coordinates: [1, 0], direction: 'left', operator: 'ge', source: 'cell' };
        case 'code':
            return { kind: 'code', code: 'level => true' };
        default:
            return { kind: 'noBoxes' };
    }
}

const compare = (operator: WinOperator, a: number, b: number): boolean => {
    switch (operator) {
        case 'eq': return a === b;
        case 'ne': return a !== b;
        case 'gt': return a > b;
        case 'ge': return a >= b;
        case 'lt': return a < b;
        case 'le': return a <= b;
        default: return false;
    }
};

const countBoxes = (level: Level): number => {
    let count = 0;
    Object.values(level.cells).forEach(cell => {
        if (cell.item && !cell.item.destroyed) count++;
    });
    level.getCharacters().forEach(character => {
        if (!character.isDead && character.item && !character.item.destroyed) count++;
    });
    return count;
};

const boxWithTag = (level: Level, tag: string): Box | undefined => {
    for (const cell of Object.values(level.cells)) {
        if (cell.item && !cell.item.destroyed && cell.item.tag === tag) return cell.item;
    }
    for (const character of level.getCharacters()) {
        if (character.item && !character.item.destroyed && character.item.tag === tag) return character.item;
    }
    return undefined;
};

const valueAt = (level: Level, coordinates: [number, number], source?: WinValueSource): number | undefined => {
    const cell = level.getCell(coordinates[0], coordinates[1]);
    if (!cell) return undefined;
    if (source === 'character') {
        return cell.character?.item?.value;
    }
    return cell.item?.value;
};

const compareValues = (operator: WinOperator, a: number | undefined, b: number | undefined): boolean => {
    if (a === undefined || b === undefined) return false;
    return compare(operator, a, b);
};

const neighborCell = (level: Level, coordinates: [number, number], direction: NeighborDirection): Cell | undefined => {
    if (direction === 'up') return level.getCell(coordinates[0], coordinates[1] - 1);
    if (direction === 'down') return level.getCell(coordinates[0], coordinates[1] + 1);
    if (direction === 'left') return level.getCell(coordinates[0] - 1, coordinates[1]);
    return level.getCell(coordinates[0] + 1, coordinates[1]);
};

const evaluateCondition = (level: Level, condition: WinCondition): boolean => {
    switch (condition.kind) {
        case 'noBoxes':
            return countBoxes(level) === 0;
        case 'boxCount':
            return compare(condition.operator, countBoxes(level), condition.value);
        case 'cellsHaveItems':
            return condition.coordinates.every(([x, y]) => !!level.getCell(x, y)?.item);
        case 'cellsEmpty':
            return condition.coordinates.every(([x, y]) => {
                const cell = level.getCell(x, y);
                return !!cell && !cell.item && !cell.character;
            });
        case 'tagPresent':
            return !!boxWithTag(level, condition.tag);
        case 'tagAbsent':
            return !boxWithTag(level, condition.tag);
        case 'characterAt':
            return !!level.getCell(condition.coordinates[0], condition.coordinates[1])?.character;
        case 'shredded': {
            const cell = level.getCell(condition.coordinates[0], condition.coordinates[1]);
            if (!cell || cell.getType() !== CellType.Shredder) return false;
            return compare(condition.operator, (cell as Shredder).shredded, condition.value);
        }
        case 'sortedByItemValue': {
            if (condition.coordinates.length < 2) return false;
            const values = condition.coordinates.map(c => valueAt(level, c, condition.source));
            for (let i = 1; i < values.length; i++) {
                const ok = condition.ascending
                    ? compareValues('ge', values[i], values[i - 1])
                    : compareValues('le', values[i], values[i - 1]);
                if (!ok) return false;
            }
            return true;
        }
        case 'neighborCompare': {
            const a = valueAt(level, condition.coordinates, condition.source);
            const neighbor = neighborCell(level, condition.coordinates, condition.direction);
            const b = neighbor ? valueAt(level, [neighbor.x, neighbor.y], condition.source) : undefined;
            return compareValues(condition.operator, a, b);
        }
        case 'code': {
            try {
                // eslint-disable-next-line no-new-func
                const fn = new Function(`return (${condition.code});`)() as (lvl: Level) => boolean;
                return !!fn(level);
            } catch (e) {
                console.error('Failed to evaluate "code" win condition', e);
                return false;
            }
        }
        default:
            return false;
    }
};

export function evaluateConditions(level: Level, list: WinConditionsList | undefined): boolean {
    if (!list || !list.conditions || list.conditions.length === 0) return false;
    if (list.mode === 'any') {
        return list.conditions.some(condition => evaluateCondition(level, condition));
    }
    return list.conditions.every(condition => evaluateCondition(level, condition));
}