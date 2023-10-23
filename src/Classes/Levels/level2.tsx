import { GameSerialized } from '../Game';
import Level, { LevelSerializedType } from '../Level';
import { OperatorType } from '../Operators/Operator';
import { Direction, StepType } from '../Operators/OperatorStep';

const level:GameSerialized = {
    level: {
        task: 'Move boxes',
        width: 5,
        height: 5,
        cells: Level.parseCells(
            `box|1 box|1 empty box|1 empty
        empty empty wall box|2 empty
        empty empty wall box|3 empty
        empty empty empty box|4 empty
        empty empty empty box|5 empty`,
            //         `box|1 box|1
            // empty empty`,
            [
                {
                    coordinates: [0, 0], name: 'first', color: 'red',
                },
                {
                    coordinates: [1, 0], name: 'second', color: 'green',
                },
            ],
        ),
        winCallback: level => Object.values(level.cells).filter(cell => cell.item).length +
        level.getCharacters().filter(character => !character.isDead && character.item).length === 5,
    },
    code: ([
        {
            type: OperatorType.Step,
            stepType: StepType.Direction,
            directions: [
                Direction.Left,
                Direction.Right,
                Direction.Up,
                Direction.Down,
            ],
        },
        {
            type: OperatorType.Step,
            stepType: StepType.Direction,
            directions: [
                Direction.Left,
                Direction.Right,
                Direction.Up,
                Direction.Down,
            ],
        },
        { type: OperatorType.Pickup },
        {
            type: OperatorType.Step,
            stepType: StepType.Direction,
            directions: [
                Direction.Left,
                Direction.Right,
                Direction.Up,
                Direction.Down,
            ],
        },
        {
            type: OperatorType.Step,
            stepType: StepType.Direction,
            directions: [
                Direction.Left,
                Direction.Right,
                Direction.Up,
                Direction.Down,
            ],
        },
        { type: OperatorType.Drop },
        { type: OperatorType.Goto, line: 0 },
    ]),
};

export default level;
