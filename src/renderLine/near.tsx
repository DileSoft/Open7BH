import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { OperatorNearSerialized, OperatorNearType } from '../Classes/Operators/OperatorNear';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';
import i18n from '../i18n';
import { trOption } from '../tr';

const nearRenderLine:RenderLineType<OperatorNearSerialized> = (line, lineNumber, game):React.ReactNode => <span>
<CommandBadge type={OperatorType.Near} />
    {' '}
    {String(i18n.t('common.slot'))}
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
            <MenuItem key={option} value={option}>{trOption('nearType', option)}</MenuItem>)}
    </Select>
</span>;

export default nearRenderLine;
