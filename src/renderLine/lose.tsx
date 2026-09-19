import { TextField } from '@mui/material';
import React from 'react';
import { RenderLineType } from '../types';
import { OperatorLoseSerialized } from '../Classes/Operators/OperatorLose';
import { OperatorType } from '../Classes/Operators/Operator';
import CommandBadge from './CommandBadge';
import i18n from '../i18n';

const loseRenderLine:RenderLineType<OperatorLoseSerialized> = (line, lineNumber, game):React.ReactNode => {
    if (!game.object) {
        return null;
    }

    return <span>
        <CommandBadge type={OperatorType.Lose} />
        {' '}
        <TextField
            value={line.reason ?? ''}
            placeholder={String(i18n.t('common.reason'))}
            variant="standard"
            onChange={e => {
                line.object?.setReason(e.target.value || undefined);
                game.object?.render();
            }}
        />
    </span>;
};

export default loseRenderLine;
