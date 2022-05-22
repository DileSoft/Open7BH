import { LevelType } from '../types';
import { parseCells } from '../Utils';

const level:LevelType = {
    task: 'Print and shred 10 boxes (no move)',
    width: 7,
    height: 5,
    cells: parseCells(
        `hole hole hole hole hole hole hole
hole empty empty empty empty empty hole
hole printer hole hole hole shredder hole
hole hole hole hole hole hole hole
hole hole hole hole hole hole hole`,
    ),
    characters: ([
        {
            coordinates: '1x1', name: '1', color: 'purple', step: -1,
        },
        {
            coordinates: '2x1', name: '2', color: 'red', step: -1,
        },
        {
            coordinates: '3x1', name: '3', color: 'green', step: -1,
        },
        {
            coordinates: '4x1', name: '4', color: 'yellow', step: -1,
        },
        {
            coordinates: '5x1', name: '5', color: 'blue', step: -1,
        },
    ]),
    code: ([
    ]),
    win: (cells, characters) => cells['5x2'].shredded >= 10,
};

export default level;
