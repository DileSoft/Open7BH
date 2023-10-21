import Box from './Box';
import Cell from './Cell';
import Hole from './Hole';
import Level from './Level';
import { Direction } from './Operators/OperatorStep';
import Slot from './Slot';

class Character {
    name: string;

    color = 'green';

    cell: Cell;

    item: Box | null = null;

    isTerminated = false;

    isDead = false;

    slots: Slot[] = [];

    currentLine = 0;

    constructor(cell: Cell, name: string) {
        this.cell = cell;
        this.name = name;
    }

    update() {
        if (this.isTerminated) {
            return;
        }
        const code = this.cell.level.game.code;
        if (this.currentLine >= code.length) {
            return;
        }
        const operator = code[this.currentLine];
        this.currentLine = operator.execute(this);
        if (this.currentLine >= code.length) {
            this.isTerminated = true;
        }
    }

    setItem(item: Box) {
        this.item = item;
    }

    giveItem(direction: Direction):void {
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        if (newCell && newCell.character && !newCell.character.item && this.item) {
            newCell.character.setItem(this.item);
            this.item = null;
        }
    }

    write(value: number) {
        if (this.item) {
            this.item.value = value;
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

    move(direction: Direction):void {
        const newCell: Cell | undefined = this.cell.level.getMoveCell(this.cell.x, this.cell.y, direction);
        console.log(newCell);
        if (newCell) {
            this.cell.character = null;
            newCell.setCharacter(this);
            if (newCell instanceof Hole) {
                this.die();
            }
        }
    }

    terminate() {
        this.isTerminated = true;
    }

    die() {
        this.isDead = true;
        this.terminate();
    }
}

export default Character;
