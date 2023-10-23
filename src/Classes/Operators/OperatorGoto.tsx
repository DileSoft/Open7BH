import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorGotoSerialized extends OperatorSerialized {
    type: OperatorType.Goto,
    line: number,
    object?: OperatorGoto,
}

class OperatorGoto extends Operator {
    line: number = 0;

    execute(character: Character): number {
        return this.line;
    }

    setLine(line: number) {
        this.line = line;
    }

    serialize(withObject: boolean): OperatorGotoSerialized {
        return {
            type: OperatorType.Goto,
            line: this.line,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorGotoSerialized): void {
        this.line = operator.line;
    }
}

export default OperatorGoto;
