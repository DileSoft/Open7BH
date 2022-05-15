import { LevelType } from './types';
import { parseCells } from './Utils';

const levels:LevelType[] = [
    {
        task: 'Remove two boxes',
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
        win: (cells, characters) => Object.values(cells).filter(cell => cell.item?.type === 'box').length +
            characters.filter(character => !character.terminated && character.item?.type === 'box').length === 5,
    },
    {
        task: 'Move boxes',
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
        win: (cells, characters) => Object.values(cells).filter(cell => cell.item?.type === 'box').length +
            characters.filter(character => character.item?.type === 'box').length === 5,
    },
    {
        task: 'Remove only box with 2',
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
        win: (cells, characters) => (Object.values(cells).find(cell => cell.item?.tag === 'tag1') || characters.find(character => character.item?.tag === 'tag1')) &&
        !(Object.values(cells).find(cell => cell.item?.tag === 'tag2') || characters.find(character => !character.terminated && character.item?.tag === 'tag2')),
    },
    {
        task: 'Diagonal boxes',
        width: 5,
        height: 5,
        cells: parseCells(
            `empty empty empty empty empty
box|1 box|1 box|1 box|1 box|1
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty`,
        ),
        characters: ([
            {
                coordinates: '1x1', name: 'first', color: 'red', step: -1,
            },
            {
                coordinates: '2x1', name: 'second', color: 'green', step: -1,
            },
            {
                coordinates: '3x1', name: '3', color: 'yellow', step: -1,
            },
            {
                coordinates: '4x1', name: '4', color: 'blue', step: -1,
            },
        ]),
        code: ([
        ]),
        win: (cells, characters) => cells['0x1'].item?.type === 'box' &&
            cells['1x2'].item?.type === 'box' &&
            cells['2x3'].item?.type === 'box' &&
            cells['3x4'].item?.type === 'box' &&
            cells['4x5'].item?.type === 'box',
    },
];

export default levels;
