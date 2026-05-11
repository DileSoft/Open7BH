import React from 'react';
import ManIcon from '@mui/icons-material/Man';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import WestIcon from '@mui/icons-material/West';
import {
    RenderLineType,
} from '../types';
import { OperatorTakeSerialized } from '../Classes/Operators/OperatorTake';
import { Direction } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';

const takeRenderLine:RenderLineType<OperatorTakeSerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }

    return <span>
Take
    {' '}
    <ManIcon fontSize="small" />
    <WestIcon fontSize="small" />
    <CheckBoxOutlineBlankIcon fontSize="small" />
    {' '}
    <DirectionGrid
        value={line.direction}
        onChange={newDir => {
            line.object?.setDirection(newDir as Direction);
            game.object?.render();
        }}
    />
</span>;
};

export default takeRenderLine;
