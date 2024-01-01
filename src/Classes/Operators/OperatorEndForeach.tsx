import Character from '../Character';
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
        const foreachOperator:OperatorForeach = this.level.game.code.find(_operator => _operator.id === this.operatorForeach.id) as OperatorForeach;
        const directions = foreachOperator.directions;
        const direction = character.foreachLoops[this.operatorForeach.id];
        const index = directions.indexOf(direction);
        if (index === directions.length - 1) {
            character.foreachLoops[this.operatorForeach.id] = undefined;
            return character.currentLine + 1;
        }
        return this.level.game.code.findIndex(operator => operator === foreachOperator);
    }

    serialize(withObject: boolean): OperatorEndForeachSerialized {
        return {
            type: OperatorType.EndForeach,
            id: this.id,
            operatorForeach: this.operatorForeach.id,
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
}

export default OperatorEndForeach;
