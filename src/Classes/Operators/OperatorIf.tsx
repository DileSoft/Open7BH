import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorEndIf from './OperatorEndIf';

export interface OperatorIfSerialized extends OperatorSerialized {
    type: OperatorType.If,
    operatorEndIf: string
    object?: OperatorIf,
}

class OperatorIf extends Operator {
    operatorEndIf: OperatorEndIf;

    execute(character: Character): number {
        return character.currentLine + 1;
    }

    createEndIf(): OperatorEndIf {
        const operatorEndIf = new OperatorEndIf(this.level);
        operatorEndIf.operatorIf = this;
        this.operatorEndIf = operatorEndIf;

        return operatorEndIf;
    }

    serialize(withObject: boolean): OperatorIfSerialized {
        return {
            type: OperatorType.If,
            operatorEndIf: this.operatorEndIf.id,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorIf;
