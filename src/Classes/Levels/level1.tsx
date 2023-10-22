import Level, { LevelSerializedType } from '../Level';

const level:LevelSerializedType = {
    task: 'Remove two boxes',
    width: 5,
    height: 7,
    cells: Level.parseCells(
        `box|1 box|1 hole box|1 hole
empty empty hole box|2 empty
empty empty hole box|3 empty
empty empty hole box|4 printer
empty empty empty box|5 empty
hole hole
hole hole`,
        [
            {
                coordinates: [0, 0], name: 'first', color: 'red',
            },
            {
                coordinates: [1, 0], name: 'second', color: 'green',
            },
        ],
    ),
    winCallback: level => Object.values(level.cells).filter(cell => cell.item).length +
        level.getCharacters().filter(character => !character.isDead && character.item).length === 5,
};

export default level;