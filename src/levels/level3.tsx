import { LevelType } from '../types';
import { parseCells } from '../Utils';

const level:LevelType = {
    task: 'Remove only box with 2',
    width: 5,
    height: 7,
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
        {
            type: 'if',
            conditions: [{ value1: { type: 'direction', value: 'here' }, operation: '>', value2: { type: 'number', value: 1 } }],
            id: 'if1',
        },
        { type: 'pickup' },
        { type: 'endif', ifId: 'if1' },
        { type: 'goto', step: 0 },
    ]),
    win: (cells, characters) => (Object.values(cells).find(cell => cell.item?.tag === 'tag1') || characters.find(character => character.item?.tag === 'tag1')) &&
    !(Object.values(cells).find(cell => cell.item?.tag === 'tag2') || characters.find(character => !character.terminated && character.item?.tag === 'tag2')),
};

export default level;
