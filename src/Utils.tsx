import SouthIcon from '@mui/icons-material/South';
import NorthIcon from '@mui/icons-material/North';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import {
    CoordinatesArrayType, CoordinatesType,
} from './types';
import { Direction, DirectionWithHere } from './Classes/Operators/OperatorStep';

export const parseCoordinates = (cellCoordinate:CoordinatesType):CoordinatesArrayType => cellCoordinate.split('x').map(value => parseInt(value));

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

export const directionIcon = (direction:Direction | DirectionWithHere) => {
    const icons = {
        [DirectionWithHere.Left]: WestIcon,
        [DirectionWithHere.Right]: EastIcon,
        [DirectionWithHere.Up]: NorthIcon,
        [DirectionWithHere.Down]: SouthIcon,
        [DirectionWithHere.UpLeft]: NorthWestIcon,
        [DirectionWithHere.UpRight]: NorthEastIcon,
        [DirectionWithHere.DownLeft]: SouthWestIcon,
        [DirectionWithHere.DownRight]: SouthEastIcon,
        [DirectionWithHere.Here]: null,
    };

    const Icon = icons[direction];
    return Icon ? <Icon fontSize="small" /> : null;
};

export const clone = <T, >(input:T):T => JSON.parse(JSON.stringify(input)) as T;
