import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import React from 'react';
import {
    RenderLineType,
} from '../types';
import { OperatorSaySerialized } from '../Classes/Operators/OperatorSay';
import { Direction } from '../Classes/Operators/OperatorStep';
import { DirectionGrid } from '../DirectionGrid';

const sayRenderLine:RenderLineType<OperatorSaySerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!line.object || !game.object) {
        return null;
    }

    const isAll = line.direction === 'all';

    return <span>
    Say:
    {' '}
    <TextField
        value={line.hear}
        variant="standard"
        onChange={e => {
            line.object?.setSay(e.target.value);
            game.object?.render();
        }}
    />
    <FormControlLabel
        control={
            <Checkbox
                checked={isAll}
                size="small"
                onChange={e => {
                    if (e.target.checked) {
                        line.object?.setDirection('all');
                    } else {
                        line.object?.setDirection(Direction.Down);
                    }
                    game.object?.render();
                }}
            />
        }
        label="all"
    />
    {!isAll &&
        <DirectionGrid
            value={line.direction as Direction}
            onChange={newDir => {
                line.object?.setDirection(newDir as Direction);
                game.object?.render();
            }}
        />
    }
</span>;
};

export default sayRenderLine;
