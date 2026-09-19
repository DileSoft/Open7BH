import { TextField } from '@mui/material';
import React from 'react';
import { RenderLineType } from '../types';
import { OperatorHearSerialized } from '../Classes/Operators/OperatorHear';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';

const hearRenderLine:RenderLineType<OperatorHearSerialized> = (line, lineNumber, game):React.ReactNode => <span>
    <CommandBadge type={OperatorType.Hear} />
    {' '}
    <TextField
        value={line.hear}
        variant="standard"
        onChange={e => {
            line.object.hear = e.target.value;
            game.object.render();
        }}
    />
</span>;

export default hearRenderLine;
