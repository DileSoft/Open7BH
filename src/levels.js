import { parseCells } from './Utils';

export default [
    {
        width: 5,
        height: 5,
        cells: parseCells(
            `box|1 box|1 empty box|1 empty
empty empty wall box|2 empty
empty empty wall box|3 empty
empty empty empty box|4 empty
empty empty empty box|5 empty
hole hole
hole hole`,
        ),
        characters: ([
            {
                cooordinates: '0x0', name: 'first', color: 'red', step: -1,
            },
            {
                cooordinates: '1x0', name: 'second', color: 'green', step: -1,
            },
        ]),
        code: ([
        ]),
        task: 'Remove two boxes',
        win: (cells, characters) => Object.values(cells).filter(cell => cell.type === 'box').length +
            characters.filter(character => character.item === 'box').length === 5,
    },
    {
        width: 5,
        height: 5,
        cells: parseCells(
            `box|1 box|1 empty box|1 empty
empty empty wall box|2 empty
empty empty wall box|3 empty
empty empty empty box|4 empty
empty empty empty box|5 empty`,
        ),
        characters: ([
            {
                cooordinates: '0x0', name: 'first', color: 'red', step: -1,
            },
            {
                cooordinates: '1x0', name: 'second', color: 'green', step: -1,
            },
        ]),
        code: ([
            { type: 'step', directions: ['left', 'right', 'top', 'bottom'] },
            { type: 'step', directions: ['left', 'right', 'top', 'bottom'] },
            { type: 'pickup' },
            { type: 'step', directions: ['left', 'right', 'top', 'bottom'] },
            { type: 'step', directions: ['left', 'right', 'top', 'bottom'] },
            { type: 'drop' },
            { type: 'goto', step: 0 },
        ]),
        task: 'Move boxes',
        win: (cells, characters) => Object.values(cells).filter(cell => cell.type === 'box').length +
            characters.filter(character => character.item === 'box').length === 5,
    },
    {
        width: 5,
        height: 5,
        cells: parseCells(
            `box|1 box|1 empty box|1 empty
box|2 empty wall box|2 empty
empty empty wall box|3 empty
empty empty empty box|4 empty
empty empty empty box|5 empty
hole hole
hole hole`,
        ),
        characters: ([
            {
                cooordinates: '0x0', name: 'first', color: 'red', step: -1,
            },
            {
                cooordinates: '1x0', name: 'second', color: 'green', step: -1,
            },
        ]),
        code: ([
            { type: 'step', directions: ['bottom'] },
            { type: 'if', conditions: [{ value1: 'here', operation: '>', value2: '1' }] },
            { type: 'pickup' },
            { type: 'endif' },
            { type: 'goto', step: 0 },
        ]),
        task: 'Condition',
        win: (cells, characters) => Object.values(cells).filter(cell => cell.type === 'box').length +
            characters.filter(character => character.item === 'box').length === 5,
    },
];
