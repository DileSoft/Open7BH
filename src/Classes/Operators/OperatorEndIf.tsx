import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorIf from './OperatorIf';

export interface OperatorEndIfSerialized extends OperatorSerialized {
    type: OperatorType.EndIf,
    operatorIf: string
    object?: OperatorEndIf,
}

class OperatorEndIf extends Operator {
    operatorIf: OperatorIf;

    remove() {
        const operatorIf = this.level.game.code.findIndex(operator => operator === this.operatorIf);
        this.level.game.code.splice(operatorIf, 1);
    }

    execute(character: Character): number {
        return character.currentLine + 1;
    }

    serialize(withObject: boolean): OperatorEndIfSerialized {
        return {
            type: OperatorType.EndIf,
            operatorIf: this.operatorIf.id,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorEndIf;
