import Level, { LevelSerializedType } from './Level';
import Operator, { OperatorSerialized, OperatorType } from './Operators/Operator';
import OperatorDrop from './Operators/OperatorDrop';
import OperatorGoto from './Operators/OperatorGoto';
import OperatorIf from './Operators/OperatorIf';
import OperatorPickup from './Operators/OperatorPickup';
import OperatorStep from './Operators/OperatorStep';
import OperatorWrite from './Operators/OperatorWrite';

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
            operatorObject = new OperatorGoto(this.level);
        }
        if (operator === OperatorType.Hear) {
            // do nothing
        }
        if (operator === OperatorType.If) {
            operatorObject = new OperatorIf(this.level);
            this.code.splice(position, 0, (operatorObject as OperatorIf).createEndIf());
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
            operatorObject = new OperatorWrite(this.level);
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
        if (!this.level.getCharacters().filter(character => !character.isTerminated).length) {
            return;
        }
        this.level.getCharacters().forEach(character => {
            character.prepare();
        });
        this.level.getCharacters().forEach(character => {
            character.update();
        });
        this.level.moveCharacters();
        this.level.winCallback(this.level);
        if (this.level.getCharacters().length < 2) {
            console.log('Wrong character');
        }
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
        console.log('render');
        this.renderCallback(this.serialize(true));
    }
}

export default Game;
