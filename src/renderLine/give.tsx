import { MenuItem, Select } from '@mui/material';
import React from 'react';
import ManIcon from '@mui/icons-material/Man';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import EastIcon from '@mui/icons-material/East';
import {
    RenderLineType,
} from '../types';
import { OperatorGiveSerialized } from '../Classes/Operators/OperatorGive';
import { Direction } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';

const giveRenderLine:RenderLineType<OperatorGiveSerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }

    return <span>
Give:
    {' '}
    <ManIcon fontSize="small" />
    <EastIcon fontSize="small" />
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

export default giveRenderLine;
