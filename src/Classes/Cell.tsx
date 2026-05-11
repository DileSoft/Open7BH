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

export interface IRenderer {
    registerCell(cell: any): void;
    updateItem(cell: any): void;
    updateCharacter(character: any): void;
    registerCharacter(character: any): void;
    clearScene(): void;
    resize(width: number, height: number): void;
}

abstract class Cell {
    static renderer: IRenderer | null = null;

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
        Cell.renderer?.registerCell(this);
    }

    getCharacter(): Character | null {
        return this.character;
    }

    setCharacter(character: Character) {
        if (this.isEmpty) {
            if (character.cell) {
                character.cell.character = null;
            }
            this.character = character;
            character.cell = this;
            Cell.renderer?.updateCharacter(character);
        }
    }

    getItem(): Box | null {
        return this.item;
    }

    setItem(item: Box) {
        this.item = item;
        Cell.renderer?.updateItem(this);
    }

    removeItem() {
        this.item = null;
        Cell.renderer?.updateItem(this);
    }
}

export default Cell;
