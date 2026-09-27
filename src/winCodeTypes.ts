/**
 * Ambient TypeScript declarations for the win-condition "custom code" editor.
 *
 * They are injected into Monaco so the `level` parameter gets full completion
 * and hover support. The code itself must stay valid JavaScript because it is
 * evaluated with `new Function`, so annotate the parameter with JSDoc:
 *
 *     /** @param {Level} level *\/
 *     level => level.getCharacters().every(c => c.isTerminated)
 */
export const LEVEL_TYPES_DTS = `
declare class Box {
    /** Current value written on the cube. */
    value: number;
    /** Optional tag set on the cube (or null). */
    tag: string | null;
    /** True when the cube was created with a random value. */
    isRandom: boolean;
    /** True after the cube was destroyed (e.g. shredded). */
    destroyed: boolean;
    setValue(value: number): void;
    setTag(tag: string): void;
    destroy(): void;
}

declare enum CellType {
    Empty = 'empty',
    Wall = 'wall',
    Hole = 'hole',
    Printer = 'printer',
    Shredder = 'shredder',
}

declare class Cell {
    x: number;
    y: number;
    /** True when a worker may stand on the tile. */
    isEmpty: boolean;
    /** Worker standing on the tile, if any. */
    character: Character | null;
    /** Data cube lying on the tile, if any. */
    item: Box | null;
    getType(): CellType;
    getItem(): Box | null;
    setItem(item: Box | null): void;
    removeItem(): void;
    getCharacter(): Character | null;
}

declare class Empty extends Cell {}
declare class Wall extends Cell {}

declare class Hole extends Cell {}

declare class Printer extends Cell {
    min: number;
    max: number;
    fixedValue?: number;
}

declare class Shredder extends Cell {
    /** How many cubes this shredder has destroyed. */
    shredded: number;
    shred(): void;
}

declare class Character {
    name: string;
    color: string;
    /** Tile the worker occupies. */
    cell: Cell;
    /** Data cube the worker is holding, if any. */
    item: Box | null;
    isDead: boolean;
    isTerminated: boolean;
    /** Current program line. */
    currentLine: number;
}

declare interface WinConditionsList {
    mode: 'all' | 'any';
    conditions: unknown[];
}

declare class Level {
    /** All tiles, keyed by "x" + "y" (see Level.getCell for safe access). */
    cells: { [coordinates: string]: Cell };
    width: number;
    height: number;
    task: string;
    winConditions: WinConditionsList;
    getCell(x: number, y: number): Cell | undefined;
    getCharacters(): Character[];
}

declare type WinPredicate = (level: Level) => boolean;
`;
