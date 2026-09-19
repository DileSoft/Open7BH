import React from 'react';
import { Button } from '@mui/material';
import { OperatorType } from '../Classes/Operators/Operator';
import { getOperatorColor } from '../commandColors';

function CommandBadge(props: { type: OperatorType; children: React.ReactNode }) {
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
            {props.children}
        </Button>
    );
}

export default CommandBadge;
