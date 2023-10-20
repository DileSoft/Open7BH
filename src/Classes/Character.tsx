import Box from './Box';
import Cell from './Cell';
import Level from './Level';

class Character {
    name: string;

    cell: Cell;

    coordinates: [number, number];

    item: Box | null = null;

    constructor(cell: Cell, name: string, coordinates: [number, number]) {
        this.cell = cell;
        this.name = name;
        this.coordinates = coordinates;
    }

    setItem(item: Box) {
        this.item = item;
    }

    giveItem(character: Character) {
        if (this.item) {
            character.setItem(this.item);
            this.item = null;
        }
    }

    pickupItem() {
        const item = this.cell.getItem();
        if (item) {
            this.setItem(item);
            this.cell.removeItem();
        }
    }

    dropItem() {
        if (this.item) {
            this.cell.setItem(this.item);
            this.item = null;
        }
    }
}

export default Character;
