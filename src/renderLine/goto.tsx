import { MenuItem, Select } from '@mui/material';
import React from 'react';
import {
    LineGotoType, RenderLineType,
} from '../types';
import { clone } from '../Utils';

const gotoRenderLine:RenderLineType<LineGotoType> = (line, lineNumber, code, setCode):React.ReactNode => <span>
Goto:
    {' '}
    <Select
        IconComponent={null}
        value={line.step}
        variant="standard"
        onChange={e => {
            const newCode = clone(code);
            newCode[lineNumber].step = e.target.value as number;
            setCode(newCode);
        }}
    >
        {Object.keys(code).map(optionLineNumber =>
            <MenuItem key={optionLineNumber} value={optionLineNumber}>{optionLineNumber}</MenuItem>)}
    </Select>
</span>;

export default gotoRenderLine;
