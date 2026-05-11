import { TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { OperatorSaySerialized } from '../Classes/Operators/OperatorSay';
import { Direction } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';

const sayRenderLine:RenderLineType<OperatorSaySerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }

    return <span>
    Say:
    {' '}
    <TextField
        value={line.hear}
        variant="standard"
        onChange={e => {
            line.object?.setSay(e.target.value);
            game.object?.render();
        }}
    />
    <DirectionGrid
        value={line.direction}
        onChange={newDir => {
            line.object?.setDirection(newDir as Direction);
            game.object?.render();
        }}
    />
</span>;
};

export default sayRenderLine;
