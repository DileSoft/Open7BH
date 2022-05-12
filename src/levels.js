import { parseCells } from './Utils';

export default [
    ({
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
            // { type: 'pickup' },
            // { type: 'step', directions: ['bottom'] },
            // { type: 'goto', step: 1 },
            // { type: 'step', directions: ['left', 'right', 'top', 'bottom'] },
            // { type: 'pickup' },
            // { type: 'step', directions: ['left', 'right', 'top', 'bottom'] },
            // { type: 'drop' },
            // { type: 'goto', step: 0 },
            // { type: 'step', directions: ['bottom'] },
            // { type: 'step', directions: ['right'] },
            // { type: 'step', directions: ['right'] },
            // { type: 'step', directions: ['right'] },
            // { type: 'step', directions: ['left'] },
            // { type: 'step', directions: ['top'] },
            // { type: 'step', directions: ['right'] },
            // { type: 'goto', step: 0 },
        ]),
        task: 'Remove two boxes',
        win: (cells, characters) => Object.values(cells).filter(cell => cell.type === 'box').length +
            characters.filter(character => character.item === 'box').length === 5,
    }),
];
