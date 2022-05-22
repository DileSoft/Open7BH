import { LevelType } from '../types';
import { parseCells } from '../Utils';

const level:LevelType = {
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
};

export default level;
