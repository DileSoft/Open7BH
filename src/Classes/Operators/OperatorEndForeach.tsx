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
    operatorForeach: OperatorForeach;

    execute(character: Character): number {
        return character.currentLine + 1;
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
        this.operatorForeach = this.level.game.code.find(_operator => _operator.id === operator.operatorForeach) as OperatorForeach;
    }
}

export default OperatorEndForeach;
