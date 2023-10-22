import Level, { LevelSerializedType } from '../Level';

const level:LevelSerializedType = {
    task: 'Move boxes',
    width: 5,
    height: 5,
    cells: Level.parseCells(
        `box|1 box|1 empty box|1 empty
        empty empty wall box|2 empty
        empty empty wall box|3 empty
        empty empty empty box|4 empty
        empty empty empty box|5 empty`,
        //         `box|1 box|1
        // empty empty`,
        [
            {
                coordinates: [0, 0], name: 'first', color: 'red',
            },
            {
                coordinates: [1, 0], name: 'second', color: 'green',
            },
        ],
    ),
    // code: ([
    //     { type: 'step', destination: { type: 'direction', directions: ['left', 'right', 'top', 'bottom'] } },
    //     { type: 'step', destination: { type: 'direction', directions: ['left', 'right', 'top', 'bottom'] } },
    //     { type: 'pickup' },
    //     { type: 'step', destination: { type: 'direction', directions: ['left', 'right', 'top', 'bottom'] } },
    //     { type: 'step', destination: { type: 'direction', directions: ['left', 'right', 'top', 'bottom'] } },
    //     { type: 'drop' },
    //     { type: 'goto', step: 0 },
    // ]),
    winCallback: level => Object.values(level.cells).filter(cell => cell.item).length +
        level.getCharacters().filter(character => !character.isDead && character.item).length === 5,
};

export default level;
