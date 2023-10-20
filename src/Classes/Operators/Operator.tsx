import Character from '../Character';
import Level from '../Level';

export enum OperatorType {
    Pickup = 'pickup',
    Drop = 'drop',
}

abstract class Operator {
    level: Level;

    constructor(level: Level) {
        this.level = level;
    }

    abstract execute(character: Character): void;
}

export default Operator;
