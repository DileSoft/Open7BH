import { v4 as uuidv4 } from 'uuid';
import { Button } from '@mui/material';
import React from 'react';
import { LineType } from './types';
import { GameSerialized } from './Classes/Game';
import OperatorStep from './Classes/Operators/OperatorStep';
import { OperatorType } from './Classes/Operators/Operator';

function AddPanel(props: {game: GameSerialized}) {
    return <>
        {Object.values(OperatorType).map(action => <div key={action}>
            <Button onClick={() => {
                props.game.object.addOperator(action, 0);
                props.game.object.render();
            }}
            >
                {`Add ${action}`}
            </Button>
        </div>)}
    </>;
}

export default AddPanel;
