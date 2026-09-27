import { MenuItem, Select, TextField } from '@mui/material';
import React from 'react';
import { RenderLineType } from '../types';
import { OperatorPickupSerialized } from '../Classes/Operators/OperatorPickup';
import { Direction, DirectionWithHere } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';
import { trOption } from '../tr';

type PickupTarget = 'here' | 'direction' | 'slot';

const pickupRenderLine:RenderLineType<OperatorPickupSerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }
    const target: PickupTarget = line.slot !== undefined
        ? 'slot'
        : (line.direction && line.direction !== DirectionWithHere.Here ? 'direction' : 'here');

    return <span>
        <CommandBadge type={OperatorType.Pickup} />
        {' '}
        <Select
            value={target}
            variant="standard"
            onChange={e => {
                const value = e.target.value as PickupTarget;
                if (value === 'here') {
                    line.object?.setDirection(DirectionWithHere.Here);
                }
                if (value === 'direction') {
                    line.object?.setDirection(Direction.Down);
                }
                if (value === 'slot') {
                    line.object?.setSlot(0);
                }
                game.object?.render();
            }}
        >
            <MenuItem value="here">{trOption('targetType', 'here')}</MenuItem>
            <MenuItem value="direction">{trOption('targetType', 'direction')}</MenuItem>
            <MenuItem value="slot">{trOption('targetType', 'slot')}</MenuItem>
        </Select>
        {target === 'direction' &&
            <DirectionGrid
                value={(line.direction && line.direction !== DirectionWithHere.Here ? line.direction : Direction.Down) as Direction}
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

export default pickupRenderLine;
