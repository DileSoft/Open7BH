import Character from '../Character';
import Operator, { OperatorSerialized, OperatorType } from './Operator';
import OperatorEndForeach from './OperatorEndForeach';
import { Direction } from './OperatorStep';

export interface OperatorForeachSerialized extends OperatorSerialized {
    type: OperatorType.Foreach,
    operatorEndForeach: string
    directions: Direction[],
    slotNumber: number,
    object?: OperatorForeach,
}

class OperatorForeach extends Operator {
    operatorEndForeach: OperatorForeach;

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
            operatorEndForeach: this.operatorEndForeach.id,
            directions: this.directions,
            slotNumber: this.slotNumber,
            object: withObject ? this : undefined,
        };
    }
}

export default OperatorForeach;
