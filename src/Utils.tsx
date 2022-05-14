import SouthIcon from '@mui/icons-material/South';
import NorthIcon from '@mui/icons-material/North';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { CellType, DirectionType } from './types';

export const parseCoordinates = cellCoordinate => cellCoordinate.split('x').map(value => parseInt(value));

export const parseCells = cellsStr => {
    const result = {};
    cellsStr.split(/[\r\n]+/).forEach((line, lineIndex) => {
        line.split(/ +/).forEach((cell, cellIndex) => {
            const cellData = cell.split('|');
            const cellObject:CellType = {
                type: cellData[0],
            };
            if (cellObject.type === 'box') {
                cellObject.type = 'empty';
                cellObject.item = { type: 'box', value: parseInt(cellData[1]), tag: cellData[2] };
            }
            result[`${cellIndex}x${lineIndex}`] = cellObject;
        });
    });

    return result;
};

export const randomArray = <T, >(array:T[]):T => array[Math.floor(Math.random() * array.length)];

export const moveCoordinates = (coordinates, direction:DirectionType) => {
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

export const directionIcon = direction => {
    const icons = {
        left: WestIcon,
        right: EastIcon,
        top: NorthIcon,
        bottom: SouthIcon,
        'top-left': NorthWestIcon,
        'top-right': NorthEastIcon,
        'bottom-left': SouthWestIcon,
        'bottom-right': SouthEastIcon,
        here: FiberManualRecordIcon,
    };

    const Icon = icons[direction];
    return Icon ? <Icon fontSize="small" /> : null;
};

export const clone = <T, >(input:T):T => JSON.parse(JSON.stringify(input)) as T;