import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { directionIcon } from '../Utils';
import { OperatorForeachSerialized } from '../Classes/Operators/OperatorForeach';
import { Direction } from '../Classes/Operators/OperatorStep';

const foreachRenderLine:RenderLineType<OperatorForeachSerialized> = (line, lineNumber, game):React.ReactNode => <span>
Foreach:
    {' '}
    <Select
        IconComponent={null}
        value={line.directions}
        variant="standard"
        multiple
        onChange={e => {
            line.object.setDirections(e.target.value as Direction[]);
            game.object.render();
        }}
    >
        {Object.values(Direction).map(direction =>
            <MenuItem key={direction} value={direction}>
                {directionIcon(direction)}
                {direction}
            </MenuItem>)}
    </Select>
    <TextField
        type="number"
        value={line.slotNumber}
        variant="standard"
        onChange={e => {
            line.object.slotNumber = parseInt(e.target.value) || 0;
            game.object.render();
        }}
    />
</span>;

export default foreachRenderLine;
