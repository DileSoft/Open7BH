import CellSlot from '../CellSlot';
import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorEndForeach from './OperatorEndForeach';
import { Direction } from './OperatorStep';

export interface OperatorForeachSerialized extends OperatorSerialized {
    type: OperatorType.Foreach,
    id: string,
    operatorEndForeach: string
    directions: Direction[],
    slotNumber: number,
    object?: OperatorForeach,
}

class OperatorForeach extends Operator {
    operatorEndForeachId: string;

    operatorEndForeach: OperatorEndForeach;

    directions: Direction[] = [];

    slotNumber = 0;

    execute(character: Character): number {
        if (character.foreachLoops[this.id]) {
            const directions = this.directions;
            const direction = character.foreachLoops[this.id];
            const index = directions.indexOf(direction);
            character.foreachLoops[this.id] = directions[index + 1];
            const slot = new CellSlot(character);
            slot.setCell(this.level.getMoveCell(character.cell.x, character.cell.y, directions[index + 1]));
            character.slots[this.slotNumber] = slot;
        } else {
            character.foreachLoops[this.id] = this.directions[0];
            const slot = new CellSlot(character);
            slot.setCell(this.level.getMoveCell(character.cell.x, character.cell.y, this.directions[0]));
            character.slots[this.slotNumber] = slot;
        }
        return character.currentLine + 1;
    }

    createEndForeach(): OperatorEndForeach {
        const operatorEndForeach = new OperatorEndForeach(this.level);
        operatorEndForeach.operatorForeach = this;
        this.operatorEndForeach = operatorEndForeach;

        return operatorEndForeach;
    }

    setDirections(directions: Direction[]) {
        this.directions = directions;
    }

    serialize(withObject: boolean): OperatorForeachSerialized {
        return {
            type: OperatorType.Foreach,
            id: this.id,
            operatorEndForeach: this.operatorEndForeach.id,
            directions: this.directions,
            slotNumber: this.slotNumber,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorForeachSerialized): void {
        this.id = operator.id;
        this.operatorEndForeachId = operator.operatorEndForeach;
        this.directions = operator.directions;
        this.slotNumber = operator.slotNumber;
    }

    postDeserialize() {
        this.operatorEndForeach = this.level.game.code.find(_operator => _operator.id === this.operatorEndForeachId) as OperatorEndForeach;
    }
}

export default OperatorForeach;
