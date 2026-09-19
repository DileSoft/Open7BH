import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import i18n from '../../i18n';

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
        character.cell.level.game.lose(this.reason ?? i18n.t('game.workerGaveUp', { name: character.name }));
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
