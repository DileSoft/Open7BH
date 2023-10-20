import Box from './Box';
import Cell, { CellType } from './Cell';
import Character from './Character';
import Empty from './Empty';
import Game from './Game';
import Hole from './Hole';
import { OperatorType } from './Operators/Operator';
import { Direction } from './Operators/OperatorStep';

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
                    };
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
        console.log(str);
        str.cells.forEach(cell => {
            let cellObject: Cell;
            if (cell.type === CellType.Empty) {
                cellObject = new Empty(this, cell.x, cell.y);
            }
            if (cell.type === CellType.Hole) {
                cellObject = new Hole(this, cell.x, cell.y);
            }
            if (cell.character) {
                cellObject.setCharacter(new Character(cellObject, cell.character.name));
            }
            if (cell.item) {
                cellObject.setItem(new Box(cell.item.value, cell.item.isRandom));
            }
            this.addCell(cell.x, cell.y, cellObject);
        });
    }

    addCharacter(character: Character, x: number, y: number) {
        this.getCell(x, y).setCharacter(character);
    }

    addCell(x: number, y: number, cell: Cell) {
        this.cells[`${x}x${y}`] = cell;
    }

    getCell(x: number, y: number): Cell | undefined {
        return this.cells[`${x}x${y}`];
    }

    getMoveCell(x: number, y: number, direction: Direction): Cell | undefined {
        if (direction === Direction.Up) {
            return this.getCell(x, y - 1);
        }
        if (direction === Direction.Down) {
            return this.getCell(x, y + 1);
        }
        if (direction === Direction.Left) {
            return this.getCell(x - 1, y);
        }
        if (direction === Direction.Right) {
            return this.getCell(x + 1, y);
        }
        if (direction === Direction.UpLeft) {
            return this.getCell(x - 1, y - 1);
        }
        if (direction === Direction.UpRight) {
            return this.getCell(x + 1, y - 1);
        }
        if (direction === Direction.DownLeft) {
            return this.getCell(x - 1, y + 1);
        }
        if (direction === Direction.DownRight) {
            return this.getCell(x + 1, y + 1);
        }
        return undefined;
    }

    getCharacters(): Character[] {
        return Object.values(this.cells).map(cell => cell.getCharacter()).filter(character => character !== null);
    }
}

export default Level;
