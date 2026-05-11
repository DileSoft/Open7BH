import { TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { OperatorForeachSerialized } from '../Classes/Operators/OperatorForeach';
import { Direction } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';

const foreachRenderLine:RenderLineType<OperatorForeachSerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }

    return <span>
Foreach:
    {' '}
    <DirectionGrid
        value={line.directions}
        multiple
        onChange={newDirs => {
            line.object?.setDirections(newDirs as Direction[]);
            game.object?.render();
        }}
    />
    <TextField
        type="number"
        value={line.slotNumber}
        variant="standard"
        onChange={e => {
            line.object!.slotNumber = parseInt(e.target.value) || 0;
            game.object?.render();
        }}
    />
</span>;
};

export default foreachRenderLine;
