import { GameSerialized } from '../Game';
import Level, { LevelSerializedType } from '../Level';

const level:GameSerialized = {
    name: 'Sort numbers',
    translations: {
        task: { en: 'Sort numbers', ru: 'Сортировать числа' },
        characterNames: { '1': { en: '1', ru: '1' }, '2': { en: '2', ru: '2' }, '3': { en: '3', ru: '3' }, '4': { en: '4', ru: '4' }, '5': { en: '5', ru: '5' } },
    },
    level: {
        task: 'Sort numbers',
        width: 5,
        height: 5,
        cells: Level.parseCells(
            `empty empty empty empty empty
box|random box|0 box|random box|random box|random
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty`,
            [
                {
                    coordinates: [0, 1], name: '1', color: 'purple',
                },
                {
                    coordinates: [1, 1], name: '2', color: 'red',
                },
                {
                    coordinates: [2, 1], name: '3', color: 'green',
                },
                {
                    coordinates: [3, 1], name: '4', color: 'yellow',
                },
                {
                    coordinates: [4, 1], name: '5', color: 'blue',
                },
            ],
        ),
        winCallback: (level: Level) => [0, 1, 2, 3, 4].every(
            number => number === 0 ||
        level.cells[`${number}x1`].character?.item?.value >=
        level.cells[`${number - 1}x1`].character?.item?.value,
        ),
    },
    code: ([
    //     {
    //         type: 'pickup',
    //     },
    //     {
    //         type: 'if',
    //         id: 'if1',
    //         conditions: [
    //             {
    //                 value1: {
    //                     type: 'direction',
    //                     value: 'right',
    //                 },
    //                 operation: '<',
    //                 value2: {
    //                     type: 'myitem',
    //                 },
    //                 logic: 'OR',
    //             },
    //         ],
    //     },
    //     {
    //         type: 'give',
    //         direction:{ type: 'direction', value: 'right' },

    //     },
    //     {
    //         type: 'endif',
    //         ifId: 'if1',
    //     },
    //     {
    //         type: 'if',
    //         id: 'if2',
    //         conditions: [
    //             {
    //                 value1: {
    //                     type: 'direction',
    //                     value: 'left',
    //                 },
    //                 operation: '>',
    //                 value2: {
    //                     type: 'myitem',
    //                 },
    //                 logic: 'OR',
    //             },
    //         ],
    //     },
    //     {
    //         type: 'give',
    //         direction:{ type: 'direction', value: 'left' },
    //     },
    //     {
    //         type: 'endif',
    //         ifId: 'if2',
    //     },
    //     {
    //         type: 'goto',
    //         step: 1,
    //     },
    ]),
};

export default level;
