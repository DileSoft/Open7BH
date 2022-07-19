import { LevelType } from '../types';
import { cellCharacter, parseCells } from '../Utils';

const level:LevelType = {
    task: 'Sort numbers',
    width: 5,
    height: 5,
    cells: parseCells(
        `empty empty empty empty empty
box|random box|0 box|random box|random box|random
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty`,
    ),
    characters: ([
        {
            coordinates: '0x1', name: '1', color: 'purple', step: -1,
        },
        {
            coordinates: '1x1', name: '2', color: 'red', step: -1,
        },
        {
            coordinates: '2x1', name: '3', color: 'green', step: -1,
        },
        {
            coordinates: '3x1', name: '4', color: 'yellow', step: -1,
        },
        {
            coordinates: '4x1', name: '5', color: 'blue', step: -1,
        },
    ]),
    code: ([
        {
            type: 'pickup',
        },
        {
            type: 'if',
            id: 'if1',
            conditions: [
                {
                    value1: {
                        type: 'direction',
                        value: 'right',
                    },
                    operation: '<',
                    value2: {
                        type: 'myitem',
                    },
                    logic: 'OR',
                },
            ],
        },
        {
            type: 'give',
            direction:{ type: 'direction', value: 'right' },

        },
        {
            type: 'endif',
            ifId: 'if1',
        },
        {
            type: 'if',
            id: 'if2',
            conditions: [
                {
                    value1: {
                        type: 'direction',
                        value: 'left',
                    },
                    operation: '>',
                    value2: {
                        type: 'myitem',
                    },
                    logic: 'OR',
                },
            ],
        },
        {
            type: 'give',
            direction:{ type: 'direction', value: 'left' },
        },
        {
            type: 'endif',
            ifId: 'if2',
        },
        {
            type: 'goto',
            step: 1,
        },
    ]),
    win: (cells, characters) => [0, 1, 2, 3, 4].every(
        number => number === 0 ||
        cellCharacter(characters, `${number}x1`)?.item?.value >=
         cellCharacter(characters, `${number - 1}x1`)?.item?.value,
    ),
};

export default level;
