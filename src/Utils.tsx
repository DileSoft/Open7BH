import SouthIcon from '@mui/icons-material/South';
import NorthIcon from '@mui/icons-material/North';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React from 'react';
import {
    CellsType,
    CellType, CharacterType, CoordinatesArrayType, CoordinatesType, DirectionType, DirectionTypeWithHere,
} from './types';
import { Direction } from './Classes/Operators/OperatorStep';

export const parseCoordinates = (cellCoordinate:CoordinatesType):CoordinatesArrayType => cellCoordinate.split('x').map(value => parseInt(value));

export const parseCells = (cellsStr:string):CellsType => {
    const result = {};
    cellsStr.split(/[\r\n]+/).forEach((line, lineIndex) => {
        line.split(/ +/).forEach((cell, cellIndex) => {
            const cellData = cell.split('|');
            const cellObject:CellType = {
                type: cellData[0],
            } as CellType;
            if (cellData[0] === 'box') {
                cellObject.type = 'empty';
                cellObject.item = {
                    type: 'box',
                    value: parseInt(cellData[1]),
                    tag: cellData[2],
                    isRandom: cellData[1] === 'random',
                };
            }
            result[`${cellIndex}x${lineIndex}`] = cellObject;
        });
    });

    return result;
};

export const cellsStringify = (cells:CellsType):string => {
    let result = '';
    let width = 0;
    let height = 0;
    Object.keys(cells).forEach(coordinates => {
        const coordinatesArray = parseCoordinates(coordinates);
        if (coordinatesArray[0] + 1 > width) {
            width = coordinatesArray[0] + 1;
        }
        if (coordinatesArray[1] + 1 > height) {
            height = coordinatesArray[1] + 1;
        }
    });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = cells[`${x}x${y}`];
            if (cell) {
                if (cell.type !== 'empty') {
                    result += `${cell.type} `;
                } else if (cell.item?.type === 'box') {
                    result += `box|${cell.item.isRandom ? 'random' : cell.item.value}|${cell.item.tag || ''} `;
                } else {
                    result += 'empty ';
                }
            } else {
                result += 'nothing ';
            }
        }
        result = `${result.trim()}\n`;
    }

    return result.trim();
};

export const randomArray = <T, >(array:T[]):T => array[Math.floor(Math.random() * array.length)];

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export const getRandomArbitrary = (min:number, max:number):number => Math.random() * (max - min) + min;

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomInt = (min:number, max:number):number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const moveCoordinates = (coordinates:CoordinatesArrayType, direction:DirectionTypeWithHere):CoordinatesArrayType => {
    const newCoordinates = [...coordinates];
    if (direction === 'left') {
        newCoordinates[0] -= 1;
    }
    if (direction === 'right') {
        newCoordinates[0] += 1;
    }
    if (direction === 'top') {
        newCoordinates[1] -= 1;
    }
    if (direction === 'bottom') {
        newCoordinates[1] += 1;
    }
    if (direction === 'top-left') {
        newCoordinates[0] -= 1;
        newCoordinates[1] -= 1;
    }
    if (direction === 'top-right') {
        newCoordinates[0] += 1;
        newCoordinates[1] -= 1;
    }
    if (direction === 'bottom-left') {
        newCoordinates[0] -= 1;
        newCoordinates[1] += 1;
    }
    if (direction === 'bottom-right') {
        newCoordinates[0] += 1;
        newCoordinates[1] += 1;
    }

    return newCoordinates;
};

export const directionIcon = (direction:Direction) => {
    const icons = {
        [Direction.Left]: WestIcon,
        [Direction.Right]: EastIcon,
        [Direction.Up]: NorthIcon,
        [Direction.Down]: SouthIcon,
        [Direction.UpLeft]: NorthWestIcon,
        [Direction.UpRight]: NorthEastIcon,
        [Direction.DownLeft]: SouthWestIcon,
        [Direction.DownRight]: SouthEastIcon,
        // here: FiberManualRecordIcon,
    };

    const Icon = icons[direction];
    return Icon ? <Icon fontSize="small" /> : null;
};

export const clone = <T, >(input:T):T => JSON.parse(JSON.stringify(input)) as T;

export const cellCharacter = (characters:CharacterType[], cell:CoordinatesType):CharacterType => characters.find(character => character.coordinates === cell);
