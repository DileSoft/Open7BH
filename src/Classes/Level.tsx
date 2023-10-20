import Cell, { CellType } from './Cell';
import Character from './Character';
import Empty from './Empty';
import Hole from './Hole';

interface LevelSerializedType {
    cells: {
        x: number,
        y: number,
        type: CellType,
        character: {
            name: string,
            coordinates: [number, number],
        } | null,
    }[],
}

class Level {
    cells: { [coordinates: string]: Cell } = {};

    serialize(): LevelSerializedType {
        const result: LevelSerializedType = {
            cells: [],
        };
        Object.values(this.cells).forEach(cell => {
            const character = cell.getCharacter();
            result.cells.push({
                x: cell.x,
                y: cell.y,
                type: cell.getType(),
                character: character ? {
                    name: character.name,
                    coordinates: character.coordinates,
                } : null,
            });
        });
        return result;
    }

    deserialize(str: LevelSerializedType) {
        str.cells.forEach(cell => {
            let cellObject: Cell;
            if (cell.type === CellType.Empty) {
                cellObject = new Empty(this, cell.x, cell.y);
            }
            if (cell.type === CellType.Hole) {
                cellObject = new Hole(this, cell.x, cell.y);
            }
            if (cell.character) {
                cellObject.setCharacter(new Character(cellObject, cell.character.name, cell.character.coordinates));
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

    getCell(x: number, y: number): Cell {
        return this.cells[`${x}x${y}`];
    }

    getCharacters(): Character[] {
        return Object.values(this.cells).map(cell => cell.getCharacter()).filter(character => character !== null);
    }
}

export default Level;
