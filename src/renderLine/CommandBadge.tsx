import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { OperatorType } from '../Classes/Operators/Operator';
import { getOperatorColor } from '../commandColors';

const COMMAND_LABEL_KEYS: Record<OperatorType, string> = {
    [OperatorType.Calc]: 'commands.calc',
    [OperatorType.Pickup]: 'commands.pickup',
    [OperatorType.Drop]: 'commands.drop',
    [OperatorType.End]: 'commands.end',
    [OperatorType.Foreach]: 'commands.foreach',
    [OperatorType.EndForeach]: 'commands.endforeach',
    [OperatorType.Give]: 'commands.give',
    [OperatorType.Goto]: 'commands.goto',
    [OperatorType.Hear]: 'commands.hear',
    [OperatorType.If]: 'commands.if',
    [OperatorType.EndIf]: 'commands.endif',
    [OperatorType.Near]: 'commands.near',
    [OperatorType.Say]: 'commands.say',
    [OperatorType.Step]: 'commands.step',
    [OperatorType.Take]: 'commands.take',
    [OperatorType.Variable]: 'commands.variable',
    [OperatorType.Write]: 'commands.write',
    [OperatorType.Lose]: 'commands.lose',
};

function CommandBadge(props: { type: OperatorType; children?: React.ReactNode }) {
    const { t } = useTranslation();
    const color = getOperatorColor(props.type);
    return (
        <Button
            variant="outlined"
            size="small"
            component="span"
            tabIndex={-1}
            disableRipple
            disableFocusRipple
            sx={{
                width: 82,
                minWidth: 82,
                maxWidth: 82,
                height: 22,
                minHeight: 22,
                maxHeight: 22,
                fontSize: 11,
                padding: 0,
                lineHeight: 1,
                borderColor: color,
                color,
                cursor: 'default',
                verticalAlign: 'middle',
                marginRight: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                '&:hover': { borderColor: color, backgroundColor: 'transparent' },
            }}
        >
            {props.children ?? t(COMMAND_LABEL_KEYS[props.type])}
        </Button>
    );
}

export default CommandBadge;
