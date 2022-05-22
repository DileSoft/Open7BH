import { LevelType } from '../types';
import { parseCells } from '../Utils';

const level:LevelType = {
    task: 'Print and shred 10 boxes',
    width: 5,
    height: 5,
    cells: parseCells(
        `empty empty empty empty empty
empty empty empty empty empty
empty printer shredder empty empty
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
    ]),
    code: ([
    ]),
    win: (cells, characters) => cells['2x2'].shredded >= 10,
};

export default level;
