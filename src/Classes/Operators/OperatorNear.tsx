import { CellType } from '../Cell';
import CellSlot from '../CellSlot';
import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import { Direction } from './OperatorStep';

export enum OperatorNearType {
    Printer = 'printer',
    Shredder = 'shredder',
    Hole = 'hole',
    Empty = 'empty',
}

export interface OperatorNearSerialized extends OperatorSerialized {
    type: OperatorType.Near,
    slot: number,
    nearType: OperatorNearType,
    object?: OperatorNear,
}

class OperatorNear extends Operator {
    slot = 0;

    nearType = OperatorNearType.Printer;

    numberValue = 0;

    slotValue = 0;

    execute(character: Character): number {
        const path = this.level.findNear(
            [character.cell.x, character.cell.y],
            cell => cell.getType() === (this.nearType as CellType),
        );
        let cell = path[path.length - 1];
        if (this.nearType === OperatorNearType.Printer || this.nearType === OperatorNearType.Shredder) {
            cell = this.level.getMoveCell(cell.x, cell.y, Direction.Up);
        }
        character.slots[this.slot] = new CellSlot(character);
        (character.slots[this.slot] as CellSlot).setCell(cell);

        return character.currentLine + 1;
    }

    setSlot(slot: number) {
        this.slot = slot;
    }

    setNearType(nearType: OperatorNearType) {
        this.nearType = nearType;
    }

    serialize(withObject: boolean): OperatorNearSerialized {
        return {
            type: OperatorType.Near,
            slot: this.slot,
            nearType: this.nearType,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorNear;
