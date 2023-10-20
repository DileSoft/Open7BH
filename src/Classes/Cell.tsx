import Box from './Box';
import Character from './Character';
import Level from './Level';

export enum CellType {
    Empty = 'empty',
    Wall = 'wall',
    Hole = 'hole',
    Printer = 'printer',
    Shredder = 'shredder',
}

abstract class Cell {
    x: number;

    y: number;

    level: Level;

    character: Character | null = null;

    item: Box | null = null;

    isEmpty = false;

    abstract getType(): CellType;

    constructor(level: Level, x: number, y: number) {
        this.level = level;
        this.x = x;
        this.y = y;
    }

    getCharacter(): Character | null {
        return this.character;
    }

    setCharacter(character: Character) {
        if (this.isEmpty && !this.character) {
            this.character = character;
            character.cell = this;
        }
    }

    getItem(): Box | null {
        return this.item;
    }

    setItem(item: Box) {
        this.item = item;
    }

    removeItem() {
        this.item = null;
    }
}

export default Cell;
