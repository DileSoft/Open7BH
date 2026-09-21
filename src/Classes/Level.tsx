import Box from './Box';
import Cell, { CellType } from './Cell';
import Character, { CharacterState } from './Character';
import Empty from './Empty';
import Game from './Game';
import Hole from './Hole';
import { Direction, DirectionWithHere } from './Operators/OperatorStep';
import Printer from './Printer';
import Shredder from './Shredder';
import Wall from './Wall';
import {
    DEFAULT_WIN_CONDITIONS,
    evaluateConditions,
    WinCondition,
    WinConditionsList,
} from './WinConditions';

type WinCallback = (level: Level) => boolean;

/** Legacy win condition used by pre-declarative saves (function). */
interface LegacyLevelSerialized {
    winCallback?: WinCallback;
    winConditions?: WinConditionsList;
}

export interface CharacterSerializedType {
    name: string,
    color: string,
    coordinates?: [number, number],
    object?: Character,
}

export interface CellSerializedType {
    x: number,
    y: number,
    type: CellType,
    character?: CharacterSerializedType
    item?: {
        isRandom: boolean,
        value: number,
        tag?: string,
    }
    printer?: {
        min?: number,
        max?: number,
        fixedValue?: number,
    }
    object?: Cell,
}

export interface LevelSerializedType {
    task: string,
    width: number,
    height: number,
    winConditions: WinConditionsList,
    cells: CellSerializedType[],
    object?: Level,
}

class Level {
    game: Game;

    cells: { [coordinates: string]: Cell } = {};

    task: string;

    width: number;

    height: number;

    winConditions: WinConditionsList = DEFAULT_WIN_CONDITIONS;

    static parseCells = (cellsStr:string, characters: CharacterSerializedType[]):CellSerializedType[] => {
        const result: CellSerializedType[] = [];
        cellsStr.split(/[\r\n]+/).forEach((line, lineIndex) => {
            const trimmed = line.trim();
            if (!trimmed) return;
            trimmed.split(/ +/).forEach((cell, cellIndex) => {
                const cellData = cell.split('|');
                const cellObject:CellSerializedType = {
                    type: CellType.Empty,
                    x: cellIndex,
                    y: lineIndex,
                    character: undefined,
                };
                if (cellData[0] === 'box') {
                    const rawValue = parseInt(cellData[1], 10);
                    cellObject.item = {
                        value: Number.isNaN(rawValue) ? 0 : rawValue,
                        isRandom: cellData[1] === 'random',
                        tag: cellData[2],
                    };
                } else if (cellData[0] === 'hole') {
                    cellObject.type = CellType.Hole;
                } else if (cellData[0] === 'wall') {
                    cellObject.type = CellType.Wall;
                } else if (cellData[0] === 'printer') {
                    cellObject.type = CellType.Printer;
                    // printer|min|max  or  printer|fixed  or  printer|min|max|fixed
                    const min = cellData[1] !== undefined && cellData[1] !== '' ? parseInt(cellData[1], 10) : undefined;
                    const max = cellData[2] !== undefined && cellData[2] !== '' ? parseInt(cellData[2], 10) : undefined;
                    const fixed = cellData[3] !== undefined && cellData[3] !== '' ? parseInt(cellData[3], 10) : undefined;
                    cellObject.printer = {
                        min: min !== undefined && !Number.isNaN(min) ? min : undefined,
                        max: max !== undefined && !Number.isNaN(max) ? max : undefined,
                        fixedValue: fixed !== undefined && !Number.isNaN(fixed) ? fixed : undefined,
                    };
                    if (cellData[1] !== undefined && cellData[1] !== '' && min === undefined && max === undefined && fixed === undefined) {
                        const single = parseInt(cellData[1], 10);
                        if (!Number.isNaN(single)) {
                            cellObject.printer.fixedValue = single;
                        }
                    }
                } else if (cellData[0] === 'shredder') {
                    cellObject.type = CellType.Shredder;
                } else if (cellData[0] !== 'empty' && cellData[0] !== '') {
                    cellObject.type = CellType.Empty;
                }
                const character = characters.find(_character => _character.coordinates && _character.coordinates[0] === cellIndex && _character.coordinates[1] === lineIndex);
                if (character) {
                    cellObject.character = character;
                }
                result.push(cellObject);
            });
        });

        return result;
    };

    constructor(game: Game) {
        this.game = game;
    }

    serialize(withObject: boolean): LevelSerializedType {
        const result: LevelSerializedType = {
            task: this.task,
            width: this.width,
            height: this.height,
            cells: [],
            winConditions: this.winConditions,
            object: withObject ? this : undefined,
        };
        Object.values(this.cells).forEach(cell => {
            const character = cell.getCharacter();
            result.cells.push({
                x: cell.x,
                y: cell.y,
                type: cell.getType(),
                character: character ? {
                    name: character.name,
                    color: character.color,
                    coordinates: [cell.x, cell.y],
                    object: withObject ? character : undefined,
                } : null,
                item: cell.getItem() ? {
                    isRandom: cell.getItem().isRandom,
                    value: cell.getItem().value,
                    tag: cell.getItem().tag,
                } : undefined,
                printer: cell instanceof Printer ? {
                    min: cell.min,
                    max: cell.max,
                    fixedValue: cell.fixedValue,
                } : undefined,
                object: withObject ? cell : undefined,
            });
        });
        return result;
    }

    deserialize(str: LevelSerializedType) {
        Cell.renderer?.clearScene();
        this.task = str.task;
        this.width = str.width;
        this.height = str.height;
        const legacy = (str as unknown as LegacyLevelSerialized);
        if (legacy.winConditions) {
            this.winConditions = legacy.winConditions;
        } else if (legacy.winCallback) {
            // Old saves stored the win condition as a function. Keep them working by
            // converting the function source into an advanced "code" condition — it is
            // fully editable in the editor and survives JSON export.
            const codeCondition: WinCondition = { kind: 'code', code: legacy.winCallback.toString() };
            this.winConditions = { mode: 'all', conditions: [codeCondition] };
        } else {
            this.winConditions = { ...DEFAULT_WIN_CONDITIONS, conditions: [] };
        }
        this.cells = {};
        Cell.renderer?.resize(this.width, this.height);
        str.cells.forEach(cell => {
            let cellObject: Cell;
            if (cell.type === CellType.Hole) {
                cellObject = new Hole(this, cell.x, cell.y);
            } else if (cell.type === CellType.Printer) {
                cellObject = new Printer(this, cell.x, cell.y, cell.printer?.min, cell.printer?.max, cell.printer?.fixedValue);
            } else if (cell.type === CellType.Shredder) {
                cellObject = new Shredder(this, cell.x, cell.y);
            } else if (cell.type === CellType.Wall) {
                cellObject = new Wall(this, cell.x, cell.y);
            } else {
                cellObject = new Empty(this, cell.x, cell.y);
            }
            if (cell.character) {
                const character = new Character(cellObject, cell.character.name);
                if (cell.character.color) character.color = cell.character.color;
                cellObject.setCharacter(character);
            }
            if (cell.item) {
                cellObject.setItem(new Box(cell.item.value, cell.item.isRandom));
                if (cell.item.tag) {
                    cellObject.getItem().tag = cell.item.tag;
                }
            }
            this.addCell(cell.x, cell.y, cellObject);
        });
    }

    addCharacter(character: Character, x: number, y: number) {
        this.getCell(x, y).setCharacter(character);
    }

    evaluateWin(): boolean {
        return evaluateConditions(this, this.winConditions);
    }

    moveCharacters() {
        // This method is now legacy as movement is handled by character state machine
        // But we might still need it for resolving conflicts or hole checking
        this.getCharacters().forEach(character => {
            if (character.cell.getType() === CellType.Hole) {
                character.die();
            }
        });
    }

    addCell(x: number, y: number, cell: Cell) {
        this.cells[`${x}x${y}`] = cell;
    }

    getCell(x: number, y: number): Cell | undefined {
        return this.cells[`${x}x${y}`];
    }

    getMoveCell(x: number, y: number, direction: Direction | DirectionWithHere): Cell | undefined {
        if (direction === DirectionWithHere.Here) {
            return this.getCell(x, y);
        }
        if (direction === DirectionWithHere.Up) {
            return this.getCell(x, y - 1);
        }
        if (direction === DirectionWithHere.Down) {
            return this.getCell(x, y + 1);
        }
        if (direction === DirectionWithHere.Left) {
            return this.getCell(x - 1, y);
        }
        if (direction === DirectionWithHere.Right) {
            return this.getCell(x + 1, y);
        }
        if (direction === DirectionWithHere.UpLeft) {
            return this.getCell(x - 1, y - 1);
        }
        if (direction === DirectionWithHere.UpRight) {
            return this.getCell(x + 1, y - 1);
        }
        if (direction === DirectionWithHere.DownLeft) {
            return this.getCell(x - 1, y + 1);
        }
        if (direction === DirectionWithHere.DownRight) {
            return this.getCell(x + 1, y + 1);
        }
        return undefined;
    }

    getCharacters(): Character[] {
        return Object.values(this.cells).map(cell => cell.getCharacter()).filter(character => character !== null);
    }

    findNear(from: [number, number], find: (cell:Cell)=>boolean): Cell[] {
        const founded: string[] = [];
        const marked: { [coordinates: string]: number } = {
            [`${from[0]}x${from[1]}`]: 0,
        };
        this.markNearRecursive(from, find, 1, marked, founded);
        if (founded.length) {
            founded.sort((a, b) => marked[a] - marked[b]);
            const path = this.getPathRecursive(this.cells[founded[0]], marked);
            path.reverse();
            return path;
        }
        return [];
    }

    getPathRecursive(end: Cell, marked: { [coordinates: string]: number } = {}, result: Cell[] = []) : Cell[] {
        result.push(end);
        if (marked[`${end.x}x${end.y}`] === 0) {
            return result;
        }
        for (const k in Object.values(Direction)) {
            const direction = Object.values(Direction)[k];
            const cell = this.getMoveCell(end.x, end.y, direction);
            if (cell && marked[`${cell.x}x${cell.y}`] === marked[`${end.x}x${end.y}`] - 1) {
                return this.getPathRecursive(cell, marked, result);
            }
        }
        return result;
    }

    markNearRecursive(from: [number, number], find: (cell:Cell)=>boolean, distance: number, marked: { [coordinates: string]: number } = {}, founded: string[] = []): void {
        if (this.cells[`${from[0]}x${from[1]}`]) {
            for (const k in Object.values(Direction)) {
                const direction = Object.values(Direction)[k];
                const cell = this.getMoveCell(from[0], from[1], direction);
                if (!cell) {
                    continue;
                }
                if (cell.getType() !== CellType.Empty && !find(cell)) {
                    continue;
                }
                if (marked[`${cell.x}x${cell.y}`] !== undefined && marked[`${cell.x}x${cell.y}`] <= distance) {
                    continue;
                }
                marked[`${cell.x}x${cell.y}`] = distance;
                if (cell && find(cell)) {
                    founded.push(`${cell.x}x${cell.y}`);
                    return;
                }
                this.markNearRecursive([cell.x, cell.y], find, distance + 1, marked, founded);
            }
        }
    }

    changeSize(width: number, height: number) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (!this.cells[`${x}x${y}`]) {
                    this.cells[`${x}x${y}`] = new Empty(this, x, y);
                }
            }
        }
        this.width = width;
        this.height = height;
    }

    crop(width: number, height: number) {
        Object.keys(this.cells).forEach(key => {
            const coordinates = key.split('x');
            if (parseInt(coordinates[0]) >= width || parseInt(coordinates[1]) >= height) {
                delete this.cells[key];
            }
        });
        this.width = width;
        this.height = height;
    }
}

export default Level;
