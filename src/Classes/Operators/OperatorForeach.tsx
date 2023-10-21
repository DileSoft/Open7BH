import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorEndForeach from './OperatorEndForeach';

export interface OperatorForeachSerialized extends OperatorSerialized {
    type: OperatorType.Foreach,
    operatorEndForeach: string
    object?: OperatorForeach,
}

class OperatorForeach extends Operator {
    operatorEndForeach: OperatorEndForeach;

    execute(character: Character): number {
        return character.currentLine + 1;
    }

    createEndForeach(): OperatorEndForeach {
        const operatorEndForeach = new OperatorEndForeach(this.level);
        operatorEndForeach.operatorForeach = this;
        this.operatorEndForeach = operatorEndForeach;

        return operatorEndForeach;
    }

    serialize(withObject: boolean): OperatorForeachSerialized {
        return {
            type: OperatorType.Foreach,
            operatorEndForeach: this.operatorEndForeach.id,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorForeach;
