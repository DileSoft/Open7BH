import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorIf from './OperatorIf';

export interface OperatorEndIfSerialized extends OperatorSerialized {
    type: OperatorType.EndIf,
    operatorEndIf: string
    object?: OperatorEndIf,
}

class OperatorEndIf extends Operator {
    operatorIf: OperatorIf;

    execute(character: Character): number {
        return character.currentLine + 1;
    }

    serialize(withObject: boolean): OperatorEndIfSerialized {
        return {
            type: OperatorType.EndIf,
            operatorEndIf: this.operatorIf.id,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorEndIf;
