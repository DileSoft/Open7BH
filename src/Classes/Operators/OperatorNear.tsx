import { CellType } from '../Cell';
import CellSlot from '../CellSlot';
import Character from '../Character';
import NumberSlot from '../NumberSlot';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export enum OperatorNearType {
    Printer = CellType.Printer,
    Shredder = CellType.Shredder,
    Hole = CellType.Hole,
    Empty = CellType.Empty,
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
        const path = this.level.findNear([character.cell.x, character.cell.y], (this.nearType as CellType));

        if (path[1]) {
            character.slots[this.slot] = new CellSlot(character);
            (character.slots[this.slot] as CellSlot).setCell(path[1]);
        }

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
