import { LevelType } from '../types';
import { parseCells } from '../Utils';

const level:LevelType = {
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
        { type: 'step', destination: { type: 'direction', directions: ['left', 'right', 'top', 'bottom'] } },
        { type: 'step', destination: { type: 'direction', directions: ['left', 'right', 'top', 'bottom'] } },
        { type: 'pickup' },
        { type: 'step', destination: { type: 'direction', directions: ['left', 'right', 'top', 'bottom'] } },
        { type: 'step', destination: { type: 'direction', directions: ['left', 'right', 'top', 'bottom'] } },
        { type: 'drop' },
        { type: 'goto', step: 0 },
    ]),
    win: (cells, characters) => Object.values(cells).filter(cell => cell.item?.type === 'box').length +
        characters.filter(character => character.item?.type === 'box').length === 5,
};

export default level;
