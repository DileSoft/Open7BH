import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorGotoSerialized extends OperatorSerialized {
    type: OperatorType.Goto,
    line: number,
    label?: string,
    object?: OperatorGoto,
}

class OperatorGoto extends Operator {
    line: number = 0;

    label?: string;

    execute(character: Character): number {
        if (this.label) {
            const index = this.level.game.code.findIndex(operator => (operator as { label?: string }).label === this.label);
            if (index === -1) {
                character.stun();
                return character.currentLine + 1;
            }
            return index;
        }
        if (this.line < 0 || this.line >= this.level.game.code.length) {
            character.stun();
            return character.currentLine + 1;
        }
        return this.line;
    }

    setLine(line: number) {
        this.line = line;
        this.label = undefined;
    }

    setLabel(label: string) {
        this.label = label;
    }

    serialize(withObject: boolean): OperatorGotoSerialized {
        return {
            type: OperatorType.Goto,
            line: this.line,
            label: this.label,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorGotoSerialized): void {
        this.line = operator.line;
        this.label = operator.label;
    }
}

export default OperatorGoto;
