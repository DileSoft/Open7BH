import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    DirectionType, LineForEachType, RenderLineType,
} from '../types';
import { clone, directionIcon } from '../Utils';

const foreachRenderLine:RenderLineType<LineForEachType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
Foreach:
    {' '}
    <Select
        IconComponent={null}
        value={line.directions}
        variant="standard"
        multiple
        onChange={e => {
            const newCode = clone(code);
            newCode[lineNumber].directions = e.target.value as DirectionType[];
            setCode(newCode);
        }}
    >
        {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
            <MenuItem key={direction} value={direction}>
                {directionIcon(direction)}
                {direction}
            </MenuItem>)}
    </Select>
    <TextField
        type="number"
        value={line.slot}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            newCode[lineNumber].slot = parseInt(e.target.value) || 0;
            setCode(newCode);
        }}
    />
</span>;

export default foreachRenderLine;
