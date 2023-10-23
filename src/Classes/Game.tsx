import Level, { LevelSerializedType } from './Level';
import Operator, { OperatorSerialized, OperatorType } from './Operators/Operator';
import OperatorDrop, { OperatorDropSerialized } from './Operators/OperatorDrop';
import OperatorEnd, { OperatorEndSerialized } from './Operators/OperatorEnd';
import OperatorForeach, { OperatorForeachSerialized } from './Operators/OperatorForeach';
import OperatorGive, { OperatorGiveSerialized } from './Operators/OperatorGive';
import OperatorGoto, { OperatorGotoSerialized } from './Operators/OperatorGoto';
import OperatorHear, { OperatorHearSerialized } from './Operators/OperatorHear';
import OperatorIf, { OperatorIfSerialized } from './Operators/OperatorIf';
import OperatorNear, { OperatorNearSerialized } from './Operators/OperatorNear';
import OperatorPickup, { OperatorPickupSerialized } from './Operators/OperatorPickup';
import OperatorSay, { OperatorSaySerialized } from './Operators/OperatorSay';
import OperatorStep, { OperatorStepSerialized } from './Operators/OperatorStep';
import OperatorTake, { OperatorTakeSerialized } from './Operators/OperatorTake';
import OperatorVariable, { OperatorVariableSerialized } from './Operators/OperatorVariable';
import OperatorWrite, { OperatorWriteSerialized } from './Operators/OperatorWrite';

export enum GameState {
    Run = 'Run',
    Stop = 'Stop',
}

export interface GameSerialized {
    level: LevelSerializedType;
    code?: (
        OperatorSerialized |
        OperatorDropSerialized |
        OperatorEndSerialized |
        OperatorForeachSerialized |
        OperatorGiveSerialized |
        OperatorGotoSerialized |
        OperatorHearSerialized |
        OperatorIfSerialized |
        OperatorNearSerialized |
        OperatorPickupSerialized |
        OperatorSaySerialized |
        OperatorStepSerialized |
        OperatorTakeSerialized |
        OperatorVariableSerialized |
        OperatorWriteSerialized
    )[];
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
            operatorObject = new OperatorEnd(this.level);
        }
        if (operator === OperatorType.Goto) {
            operatorObject = new OperatorGoto(this.level);
        }
        if (operator === OperatorType.Hear) {
            operatorObject = new OperatorHear(this.level);
        }
        if (operator === OperatorType.If) {
            operatorObject = new OperatorIf(this.level);
            this.code.splice(position, 0, (operatorObject as OperatorIf).createEndIf());
        }
        if (operator === OperatorType.Say) {
            operatorObject = new OperatorSay(this.level);
        }
        if (operator === OperatorType.Step) {
            operatorObject = new OperatorStep(this.level);
        }
        if (operator === OperatorType.Take) {
            operatorObject = new OperatorTake(this.level);
        }
        if (operator === OperatorType.Variable) {
            operatorObject = new OperatorVariable(this.level);
        }
        if (operator === OperatorType.Write) {
            operatorObject = new OperatorWrite(this.level);
        }
        if (operator === OperatorType.Foreach) {
            operatorObject = new OperatorForeach(this.level);
            this.code.splice(position, 0, (operatorObject as OperatorForeach).createEndForeach());
        }
        if (operator === OperatorType.Give) {
            operatorObject = new OperatorGive(this.level);
        }
        if (operator === OperatorType.Near) {
            operatorObject = new OperatorNear(this.level);
        }

        if (operatorObject) {
            this.code.splice(position, 0, operatorObject);
        }
    }

    removeOperator(position: number) {
        const operator = this.code[position];
        this.code.splice(position, 1);
        operator.remove();
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
        console.log(this.level.cells);
        this.render();
    }

    deserialize(serialized: GameSerialized) {
        if (!this.level) {
            this.level = new Level(this);
        }
        this.level.deserialize(serialized.level);
        this.code = serialized.code.map(operator => {
            if (operator.type === OperatorType.Drop) {
                const operatorDrop = new OperatorDrop(this.level);
                operatorDrop.deserialize(operator as OperatorDropSerialized);
                return operatorDrop;
            }
            if (operator.type === OperatorType.End) {
                const operatorEnd = new OperatorEnd(this.level);
                operatorEnd.deserialize(operator as OperatorEndSerialized);
                return operatorEnd;
            }
            if (operator.type === OperatorType.Foreach) {
                const operatorForeach = new OperatorForeach(this.level);
                operatorForeach.deserialize(operator as OperatorForeachSerialized);
                return operatorForeach;
            }
            if (operator.type === OperatorType.Give) {
                const operatorGive = new OperatorGive(this.level);
                operatorGive.deserialize(operator as OperatorGiveSerialized);
                return operatorGive;
            }
            if (operator.type === OperatorType.Goto) {
                const operatorGoto = new OperatorGoto(this.level);
                operatorGoto.deserialize(operator as OperatorGotoSerialized);
                return operatorGoto;
            }
            if (operator.type === OperatorType.Hear) {
                const operatorHear = new OperatorHear(this.level);
                operatorHear.deserialize(operator as OperatorHearSerialized);
                return operatorHear;
            }
            if (operator.type === OperatorType.If) {
                const operatorIf = new OperatorIf(this.level);
                operatorIf.deserialize(operator as OperatorIfSerialized);
                return operatorIf;
            }
            if (operator.type === OperatorType.Near) {
                const operatorNear = new OperatorNear(this.level);
                operatorNear.deserialize(operator as OperatorNearSerialized);
                return operatorNear;
            }
            if (operator.type === OperatorType.Pickup) {
                const operatorPickup = new OperatorPickup(this.level);
                operatorPickup.deserialize(operator as OperatorPickupSerialized);
                return operatorPickup;
            }
            if (operator.type === OperatorType.Say) {
                const operatorSay = new OperatorSay(this.level);
                operatorSay.deserialize(operator as OperatorSaySerialized);
                return operatorSay;
            }
            if (operator.type === OperatorType.Step) {
                const operatorStep = new OperatorStep(this.level);
                operatorStep.deserialize(operator as OperatorStepSerialized);
                return operatorStep;
            }
            if (operator.type === OperatorType.Take) {
                const operatorTake = new OperatorTake(this.level);
                operatorTake.deserialize(operator as OperatorTakeSerialized);
                return operatorTake;
            }
            if (operator.type === OperatorType.Variable) {
                const operatorVariable = new OperatorVariable(this.level);
                operatorVariable.deserialize(operator as OperatorVariableSerialized);
                return operatorVariable;
            }
            if (operator.type === OperatorType.Write) {
                const operatorWrite = new OperatorWrite(this.level);
                operatorWrite.deserialize(operator as OperatorWriteSerialized);
                return operatorWrite;
            }
            return null;
        });
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
        if (!this.code[from] || !this.code[to]) {
            return;
        }
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
