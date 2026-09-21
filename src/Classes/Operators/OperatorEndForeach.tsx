import Character from '../Character';
import NothingSlot from '../NothingSlot';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorForeach from './OperatorForeach';

export interface OperatorEndForeachSerialized extends OperatorSerialized {
    type: OperatorType.EndForeach,
    id: string,
    operatorForeach: string
    object?: OperatorEndForeach,
}

class OperatorEndForeach extends Operator {
    operatorForeachId: string;

    operatorForeach: OperatorForeach;

    execute(character: Character): number {
        if (!this.operatorForeach) {
            character.stun();
            return character.currentLine + 1;
        }
        const foreachOperator:OperatorForeach = this.level.game.code.find(_operator => _operator.id === this.operatorForeach.id) as OperatorForeach;
        if (!foreachOperator) {
            character.stun();
            return character.currentLine + 1;
        }
        const directions = foreachOperator.directions;
        const direction = character.foreachLoops[this.operatorForeach.id];
        const index = directions.indexOf(direction);
        if (index === -1 || index === directions.length - 1) {
            character.foreachLoops[this.operatorForeach.id] = undefined;
            character.slots[foreachOperator.slotNumber] = new NothingSlot(character);
            return character.currentLine + 1;
        }
        return this.level.game.code.findIndex(operator => operator === foreachOperator);
    }

    serialize(withObject: boolean): OperatorEndForeachSerialized {
        return {
            type: OperatorType.EndForeach,
            id: this.id,
            operatorForeach: this.operatorForeach?.id,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorEndForeachSerialized): void {
        this.id = operator.id;
        this.operatorForeachId = operator.operatorForeach;
    }

    postDeserialize() {
        this.operatorForeach = this.level.game.code.find(_operator => _operator.id === this.operatorForeachId) as OperatorForeach;
    }

    remove() {
        const foreach = this.level.game.code.findIndex(operator => operator === this.operatorForeach);
        if (foreach !== -1) {
            this.level.game.code.splice(foreach, 1);
        }
    }
}

export default OperatorEndForeach;
