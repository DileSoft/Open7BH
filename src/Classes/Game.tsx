import Level from './Level';
import Operator, { OperatorType } from './Operators/Operator';
import OperatorPickup from './Operators/OperatorPickup';

class Game {
    level: Level;

    code: Operator[] = [];

    constructor(level: Level) {
        this.level = level;
    }

    getLevel() {
        return this.level;
    }

    setLevel(level: Level) {
        this.level = level;
    }

    addOperator(operator: OperatorType) {
        if (operator === OperatorType.Pickup) {
            this.code.push(new OperatorPickup(this.level));
        }
    }

    update():void {
        this.code.forEach(operator => {
            this.level.getCharacters().forEach(character => {
                operator.execute(character);
            });
        });
    }
}

export default Game;
