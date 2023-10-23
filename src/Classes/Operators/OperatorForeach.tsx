import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorEndForeach from './OperatorEndForeach';
import { Direction } from './OperatorStep';

export interface OperatorForeachSerialized extends OperatorSerialized {
    type: OperatorType.Foreach,
    id: string,
    operatorEndForeach: string
    directions: Direction[],
    slotNumber: number,
    object?: OperatorForeach,
}

class OperatorForeach extends Operator {
    operatorEndForeach: OperatorEndForeach;

    directions: Direction[] = [];

    slotNumber = 0;

    execute(character: Character): number {
        return character.currentLine + 1;
    }

    createEndForeach(): OperatorEndForeach {
        const operatorEndForeach = new OperatorEndForeach(this.level);
        operatorEndForeach.operatorForeach = this;
        this.operatorEndForeach = operatorEndForeach;

        return operatorEndForeach;
    }

    setDirections(directions: Direction[]) {
        this.directions = directions;
    }

    serialize(withObject: boolean): OperatorForeachSerialized {
        return {
            type: OperatorType.Foreach,
            id: this.id,
            operatorEndForeach: this.operatorEndForeach.id,
            directions: this.directions,
            slotNumber: this.slotNumber,
            object: withObject ? this : undefined,
        };
    }

    deserialize(operator: OperatorForeachSerialized): void {
        this.id = operator.id;
        this.operatorEndForeach = this.level.game.code.find(_operator => _operator.id === operator.id) as OperatorEndForeach;
        this.directions = operator.directions;
        this.slotNumber = operator.slotNumber;
    }
}

export default OperatorForeach;
