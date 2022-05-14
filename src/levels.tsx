import { LevelType } from './types';
import { parseCells } from './Utils';

const levels:LevelType[] = [
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
                coordinates: '0x0', name: 'first', color: 'red', step: -1,
            },
            {
                coordinates: '1x0', name: 'second', color: 'green', step: -1,
            },
        ]),
        code: ([
        ]),
        task: 'Remove two boxes',
        win: (cells, characters) => Object.values(cells).filter(cell => cell.item?.type === 'box').length +
            characters.filter(character => character.item?.type === 'box').length === 5,
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
                coordinates: '0x0', name: 'first', color: 'red', step: -1,
            },
            {
                coordinates: '1x0', name: 'second', color: 'green', step: -1,
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
        win: (cells, characters) => Object.values(cells).filter(cell => cell.item?.type === 'box').length +
            characters.filter(character => character.item?.type === 'box').length === 5,
    },
    {
        width: 5,
        height: 5,
        cells: parseCells(
            `empty empty empty empty empty
box|2|tag2 box|1|tag1 wall empty empty
empty empty wall empty empty
empty empty empty empty empty
empty empty empty empty empty
hole hole
hole hole`,
        ),
        characters: ([
            {
                coordinates: '0x0', name: 'first', color: 'red', step: -1,
            },
            {
                coordinates: '1x0', name: 'second', color: 'green', step: -1,
            },
        ]),
        code: ([
            { type: 'step', directions: ['bottom'] },
            { type: 'if', conditions: [{ value1: 'here', operation: '>', value2: 1 }] },
            { type: 'pickup' },
            { type: 'endif' },
            { type: 'goto', step: 0 },
        ]),
        task: 'Remove only box with 2',
        win: (cells, characters) => (Object.values(cells).find(cell => cell.item?.tag === 'tag1') || characters.find(character => character.item?.tag === 'tag1')) &&
        !(Object.values(cells).find(cell => cell.item?.tag === 'tag2') || characters.find(character => character.item?.tag === 'tag2')),
    },
];

export default levels;
