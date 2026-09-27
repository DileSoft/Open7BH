import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorIf from './OperatorIf';

export interface OperatorElseSerialized extends OperatorSerialized {
    type: OperatorType.Else,
    id: string,
    operatorIf: string
    object?: OperatorElse,
}

/**
 * Optional "else" branch of an `if`. When a worker finishes the "then" block and
 * reaches this operator it jumps past the matching EndIf; a false condition on the
 * owning `if` jumps to the line after this operator.
 */
class OperatorElse extends Operator {
    operatorIfId: string;

    operatorIf: OperatorIf;

    remove() {
        // Deleting the else branch detaches it from its if without removing the if.
        if (this.operatorIf) {
            this.operatorIf.operatorElse = undefined;
            this.operatorIf.operatorElseId = undefined;
        }
    }

    execute(character: Character): number {
        const endIfIndex = this.level.game.code.findIndex(
            operator => operator === this.operatorIf?.operatorEndIf,
        );
        if (endIfIndex === -1) {
            character.stun();
            return character.currentLine + 1;
        }
        return endIfIndex + 1;
    }

    serialize(withObject: boolean): OperatorElseSerialized {
        return {
            type: OperatorType.Else,
            id: this.id,
            operatorIf: this.operatorIf?.id,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorElseSerialized): void {
        this.id = operator.id;
        this.operatorIfId = operator.operatorIf;
    }

    postDeserialize() {
        this.operatorIf = this.level.game.code.find(_operator => _operator.id === this.operatorIfId) as OperatorIf;
    }
}

export default OperatorElse;
