import { MenuItem, Select } from '@mui/material';
import React from 'react';
import {
    LineGotoType, RenderLineType,
} from '../types';
import { clone } from '../Utils';
import { OperatorGotoSerialized } from '../Classes/Operators/OperatorGoto';

const gotoRenderLine:RenderLineType<OperatorGotoSerialized> = (line, lineNumber, game):React.ReactNode => <span>
Goto:
    {' '}
    <Select
        IconComponent={null}
        value={line.line}
        variant="standard"
        onChange={e => {
            line.object.setLine(parseInt(e.target.value.toString()));
            game.object.render();
        }}
    >
        {Object.keys(game.code).map(optionLineNumber =>
            <MenuItem key={optionLineNumber} value={optionLineNumber}>{optionLineNumber}</MenuItem>)}
    </Select>
</span>;

export default gotoRenderLine;
