import { v4 as uuidv4 } from 'uuid';

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
    EndIf = 'endif',
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
    id: string;

    level: Level;

    constructor(level: Level) {
        this.level = level;
        this.id = uuidv4();
    }

    prepare(character: Character) {
    }

    abstract execute(character: Character): number;

    abstract serialize(withObject: boolean): OperatorSerialized;
}

export default Operator;
