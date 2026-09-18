import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';

export interface OperatorLoseSerialized extends OperatorSerialized {
    type: OperatorType.Lose,
    reason?: string,
    object?: OperatorLose,
}

class OperatorLose extends Operator {
    reason?: string;

    setReason(reason?: string) {
        this.reason = reason;
    }

    execute(character: Character): number {
        character.terminate();
        character.cell.level.game.lose(this.reason ?? `Worker ${character.name} gave up`);
        return character.currentLine + 1;
    }

    serialize(withObject: boolean): OperatorLoseSerialized {
        return {
            type: OperatorType.Lose,
            reason: this.reason,
            object: withObject ? this : undefined,
        };
    }

    deserialize(serialized: OperatorLoseSerialized): void {
        this.reason = serialized.reason;
    }
}

export default OperatorLose;
