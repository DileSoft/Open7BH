import Level, { LevelSerializedType } from './Level';
import Operator, { OperatorSerialized, OperatorType } from './Operators/Operator';
import OperatorDrop from './Operators/OperatorDrop';
import OperatorPickup from './Operators/OperatorPickup';
import OperatorStep from './Operators/OperatorStep';

export enum GameState {
    Run = 'Run',
    Stop = 'Stop',
}

export interface GameSerialized {
    level: LevelSerializedType;
    code?: OperatorSerialized[];
    state?: GameState;
    speed?: number;
    object?: Game;
}

class Game {
    level: Level;

    code: Operator[] = [];

    state = GameState.Stop;

    speed = 1000;

    renderCallback: (game: GameSerialized) => void;

    interval: number | undefined;

    getLevel() {
        return this.level;
    }

    setLevel(level: Level) {
        this.level = level;
    }

    addOperator(operator: OperatorType, position: number) {
        let operatorObject: Operator | undefined;
        if (operator === OperatorType.Pickup) {
            operatorObject = new OperatorPickup(this.level);
        }
        if (operator === OperatorType.Drop) {
            operatorObject = new OperatorDrop(this.level);
        }
        if (operator === OperatorType.End) {
            // do nothing
        }
        if (operator === OperatorType.Goto) {
            // do nothing
        }
        if (operator === OperatorType.Hear) {
            // do nothing
        }
        if (operator === OperatorType.If) {
            // do nothing
        }
        if (operator === OperatorType.Say) {
            // do nothing
        }
        if (operator === OperatorType.Step) {
            operatorObject = new OperatorStep(this.level);
        }
        if (operator === OperatorType.Take) {
            // do nothing
        }
        if (operator === OperatorType.Variable) {
            // do nothing
        }
        if (operator === OperatorType.Write) {
            // do nothing
        }

        if (operatorObject) {
            this.code.splice(position, 0, operatorObject);
        }
    }

    removeOperator(position: number) {
        this.code.splice(position, 1);
    }

    start():void {
        this.state = GameState.Run;
        this.interval = window.setInterval(() => {
            if (this.state === GameState.Run) {
                this.update();
            }
        }, this.speed);
    }

    stop():void {
        clearInterval(this.interval);
        this.state = GameState.Stop;
    }

    update():void {
        this.level.getCharacters().forEach(character => {
            character.update();
        });
        this.level.winCallback(this.level);
        this.render();
    }

    deserialize(serialized: GameSerialized) {
        this.level = new Level(this);
        this.level.deserialize(serialized.level);
        // this.code = serialized.code.map(operator => {
        //     if (operator.type === OperatorType.Step) {
        //         const operatorStep = new OperatorStep(this.level);
        //         operatorStep.deserialize(operator);
        //         return operatorStep;
        //     }
        // });
    }

    serialize(withObject = false): GameSerialized {
        return {
            level: this.level.serialize(withObject),
            code: this.code.map(operator => operator.serialize(withObject)),
            state: this.state,
            speed: this.speed,
            object: withObject ? this : undefined,
        };
    }

    moveOperator(from: number, to: number) {
        const operator = this.code[from];
        this.code.splice(from, 1);
        this.code.splice(to, 0, operator);
    }

    render() {
        this.renderCallback(this.serialize(true));
    }
}

export default Game;
