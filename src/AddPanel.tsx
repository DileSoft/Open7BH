import { Button } from '@mui/material';
import { useDrag } from 'react-dnd';
import { GameSerialized } from './Classes/Game';
import { OperatorType } from './Classes/Operators/Operator';

function DraggableOperator(props: { action: OperatorType; game: GameSerialized }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'OPERATOR',
        item: { action: props.action },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [props.action]);

    return (
        <div ref={drag as any} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move', marginBottom: '8px' }}>
            <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                    if (props.game.object) {
                        props.game.object.addOperator(props.action, 0);
                        props.game.object.render();
                    }
                }}
            >
                {props.action}
            </Button>
        </div>
    );
}

function AddPanel(props: { game: GameSerialized }) {
    return (
        <div style={{ padding: '10px' }}>
            {Object.values(OperatorType).map((action) => (
                <DraggableOperator key={action} action={action} game={props.game} />
            ))}
        </div>
    );
}

export default AddPanel;
