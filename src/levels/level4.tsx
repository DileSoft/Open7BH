import { LevelType } from '../types';
import { parseCells } from '../Utils';

const level:LevelType = {
    task: 'Diagonal boxes',
    width: 5,
    height: 7,
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
    win: (cells, characters) => [0, 1, 2, 3, 4].every(number => cells[`${number}x${number + 1}`].item?.type === 'box'),
};

export default level;
