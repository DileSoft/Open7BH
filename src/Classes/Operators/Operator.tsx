import Character from '../Character';
import Level from '../Level';

export enum OperatorType {
    Calc = 'calc',
    Pickup = 'pickup',
    Drop = 'drop',
    End = 'end',
    Foreach = 'foreach',
    EndForeach = 'endforeach',
    Give = 'give',
    Goto = 'goto',
    Hear = 'hear',
    If = 'if',
    EnfIf = 'endif',
    Near = 'near',
    Say = 'say',
    Step = 'step',
    Take = 'take',
    Variable = 'variable',
    Write = 'write',

}

export interface OperatorSerialized {
    type: OperatorType;
    object?: Operator;
}

abstract class Operator {
    level: Level;

    constructor(level: Level) {
        this.level = level;
    }

    abstract execute(character: Character): void;

    abstract serialize(withObject: boolean): OperatorSerialized;
}

export default Operator;
