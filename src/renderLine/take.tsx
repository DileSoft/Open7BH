import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import ManIcon from '@mui/icons-material/Man';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import WestIcon from '@mui/icons-material/West';
import {
    RenderLineType,
} from '../types';
import { OperatorTakeSerialized } from '../Classes/Operators/OperatorTake';
import { Direction } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';
import { trOption } from '../tr';

type TakeTarget = 'direction' | 'slot';

const takeRenderLine:RenderLineType<OperatorTakeSerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }
    const target: TakeTarget = line.slot !== undefined ? 'slot' : 'direction';

    return <span>
<CommandBadge type={OperatorType.Take} />
    {' '}
    <ManIcon fontSize="small" />
    <WestIcon fontSize="small" />
    <CheckBoxOutlineBlankIcon fontSize="small" />
    {' '}
    <Select
        value={target}
        variant="standard"
        onChange={e => {
            if (e.target.value === 'direction') {
                line.object?.setDirection(Direction.Down);
            }
            if (e.target.value === 'slot') {
                line.object?.setSlot(0);
            }
            game.object?.render();
        }}
    >
        <MenuItem value="direction">{trOption('targetType', 'direction')}</MenuItem>
        <MenuItem value="slot">{trOption('targetType', 'slot')}</MenuItem>
    </Select>
    {target === 'direction' &&
        <DirectionGrid
            value={line.direction}
            onChange={newDir => {
                line.object?.setDirection(newDir as Direction);
                game.object?.render();
            }}
        />
    }
    {target === 'slot' &&
        <TextField
            type="number"
            value={line.slot}
            variant="standard"
            onChange={e => {
                line.object?.setSlot(parseInt(e.target.value) || 0);
                game.object?.render();
            }}
        />
    }
</span>;
};

export default takeRenderLine;
