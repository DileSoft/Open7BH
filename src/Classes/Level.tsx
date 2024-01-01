import Box from './Box';
import Cell, { CellType } from './Cell';
import Character from './Character';
import Empty from './Empty';
import Game from './Game';
import Hole from './Hole';
import { Direction, DirectionWithHere } from './Operators/OperatorStep';
import Printer from './Printer';
import Shredder from './Shredder';
import Wall from './Wall';

type WinCallback = (level: Level) => boolean;

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
    object?: Cell,
}

export interface LevelSerializedType {
    task: string,
    width: number,
    height: number,
    winCallback: WinCallback,
    cells: CellSerializedType[],
    object?: Level,
}

class Level {
    game: Game;

    cells: { [coordinates: string]: Cell } = {};

    task: string;

    width: number;

    height: number;

    winCallback: WinCallback;

    static parseCells = (cellsStr:string, characters: CharacterSerializedType[]):CellSerializedType[] => {
        const result: CellSerializedType[] = [];
        cellsStr.split(/[\r\n]+/).forEach((line, lineIndex) => {
            line.split(/ +/).forEach((cell, cellIndex) => {
                const cellData = cell.split('|');
                const cellObject:CellSerializedType = {
                    type: CellType.Empty,
                    x: cellIndex,
                    y: lineIndex,
                    character: undefined,
                };
                if (cellData[0] === 'box') {
                    cellObject.item = {
                        value: parseInt(cellData[1]),
                        isRandom: cellData[1] === 'random',
                        tag: cellData[2],
                    };
                }
                if (cellData[0] === 'hole') {
                    cellObject.type = CellType.Hole;
                }
                if (cellData[0] === 'wall') {
                    cellObject.type = CellType.Wall;
                }
                if (cellData[0] === 'printer') {
                    cellObject.type = CellType.Printer;
                }
                if (cellData[0] === 'shredder') {
                    cellObject.type = CellType.Shredder;
                }
                const character = characters.find(_character => _character.coordinates[0] === cellIndex && _character.coordinates[1] === lineIndex);
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
            winCallback: this.winCallback,
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
                object: withObject ? cell : undefined,
            });
        });
        return result;
    }

    deserialize(str: LevelSerializedType) {
        this.task = str.task;
        this.width = str.width;
        this.height = str.height;
        this.winCallback = str.winCallback;
        str.cells.forEach(cell => {
            let cellObject: Cell;
            if (cell.type === CellType.Empty) {
                cellObject = new Empty(this, cell.x, cell.y);
            }
            if (cell.type === CellType.Hole) {
                cellObject = new Hole(this, cell.x, cell.y);
            }
            if (cell.type === CellType.Printer) {
                cellObject = new Printer(this, cell.x, cell.y);
            }
            if (cell.type === CellType.Shredder) {
                cellObject = new Shredder(this, cell.x, cell.y);
            }
            if (cell.type === CellType.Wall) {
                cellObject = new Wall(this, cell.x, cell.y);
            }
            if (cell.character) {
                cellObject.setCharacter(new Character(cellObject, cell.character.name));
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

    moveCharacters() {
        const characters = this.getCharacters().filter(character => character.nextMove);
        const notMoved = [...characters];
        while (notMoved.length) {
            notMoved.forEach(character => {
                const nextMove = character.nextMove;
                if (nextMove && !nextMove.character) {
                    console.log(character.name, 'move to empty');
                    character.cell.character = null;
                    character.cell = nextMove;
                    nextMove.character = character;
                    notMoved.splice(notMoved.indexOf(character), 1);
                    character.nextMove = null;
                    return;
                }
                if (nextMove && nextMove.character && nextMove.character.nextMove && nextMove.character.nextMove === character.cell) {
                    const cell1 = character.cell;
                    const cell2 = nextMove.character.cell;
                    const character1 = character;
                    const character2 = nextMove.character;
                    cell1.character = character2;
                    cell2.character = character1;
                    character1.cell = cell2;
                    character2.cell = cell1;
                    notMoved.splice(notMoved.indexOf(character), 1);
                    notMoved.splice(notMoved.indexOf(nextMove.character), 1);
                    character1.nextMove = null;
                    character2.nextMove = null;
                    return;
                }
                if (nextMove && nextMove.character && !nextMove.character.nextMove) {
                    console.log(character.name, 'move to character', nextMove.character.name);
                    notMoved.splice(notMoved.indexOf(character), 1);
                    character.nextMove = null;
                }
            });
        }
        characters.forEach(character => {
            if (character.cell.getType() === CellType.Hole) {
                character.die();
            }
        });
        console.log(this.getCharacters().filter(character => character.nextMove));
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
