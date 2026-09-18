import Cell from '../Cell';
import CellSlot from '../CellSlot';
import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export enum OperatorNearType {
    Printer = 'printer',
    Shredder = 'shredder',
    Hole = 'hole',
    Empty = 'empty',
    Wall = 'wall',
    Datacube = 'datacube',
    Worker = 'worker',
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
        const find = (cell: Cell): boolean => {
            if (this.nearType === OperatorNearType.Datacube) {
                const item = cell.getItem();
                return !!item && !item.destroyed;
            }
            if (this.nearType === OperatorNearType.Worker) {
                return !!cell.character && cell.character !== character;
            }
            return cell.getType() === (this.nearType as string);
        };
        const path = this.level.findNear([character.cell.x, character.cell.y], find);
        if (!path.length) {
            character.stun();
            return character.currentLine + 1;
        }
        const cell = path[path.length - 1];
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

    deserialize(operator: OperatorNearSerialized): void {
        this.slot = operator.slot;
        this.nearType = operator.nearType;
    }
}

export default OperatorNear;
