import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { OperatorNearSerialized, OperatorNearType } from '../Classes/Operators/OperatorNear';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';

const nearRenderLine:RenderLineType<OperatorNearSerialized> = (line, lineNumber, game):React.ReactNode => <span>
<CommandBadge type={OperatorType.Near}>Near</CommandBadge>
    {' '}
    slot
    <TextField
        type="number"
        value={line.slot}
        variant="standard"
        onChange={e => {
            line.object.setSlot(parseInt(e.target.value) || 0);
            game.object.render();
        }}
    />
    =
    <Select
        IconComponent={null}
        value={line.nearType}
        onChange={e => {
            line.object.setNearType(e.target.value as OperatorNearType);
            game.object.render();
        }}
        variant="standard"
    >
        {Object.values(OperatorNearType).map(option =>
            <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </Select>
</span>;

export default nearRenderLine;
