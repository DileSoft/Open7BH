import { MenuItem, Select } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { OperatorGotoSerialized } from '../Classes/Operators/OperatorGoto';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';

const gotoRenderLine:RenderLineType<OperatorGotoSerialized> = (line, lineNumber, game):React.ReactNode => <span>
<CommandBadge type={OperatorType.Goto}>Goto</CommandBadge>
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
