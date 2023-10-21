import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorForeach from './OperatorForeach';

export interface OperatorEndForeachSerialized extends OperatorSerialized {
    type: OperatorType.Foreach,
    operatorEndForeach: string
    object?: OperatorEndForeach,
}

class OperatorEndForeach extends Operator {
    operatorForeach: OperatorForeach;

    execute(character: Character): number {
        return character.currentLine + 1;
    }

    serialize(withObject: boolean): OperatorEndForeachSerialized {
        return {
            type: OperatorType.Foreach,
            operatorEndForeach: this.operatorForeach.id,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorEndForeach;
