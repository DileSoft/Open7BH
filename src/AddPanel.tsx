import { Button } from '@mui/material';
import { useDrag } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { GameSerialized } from './Classes/Game';
import { OperatorType } from './Classes/Operators/Operator';
import { COMMAND_GROUPS } from './commandColors';

function DraggableOperator(props: { action: OperatorType; game: GameSerialized; color: string }) {
    const { t } = useTranslation();
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'OPERATOR',
        item: { action: props.action },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [props.action]);

    return (
        <div ref={drag as any} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move', minWidth: 0 }}>
            <Button
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                    fontSize: 11, padding: '4px 2px', minWidth: 0, lineHeight: 1.2,
                    whiteSpace: 'normal', wordBreak: 'break-word',
                    borderColor: props.color, color: props.color,
                    '&:hover': { borderColor: props.color, backgroundColor: `${props.color}14` },
                }}
                onClick={() => {
                    if (props.game.object) {
                        props.game.object.addOperator(props.action, 0);
                        props.game.object.render();
                    }
                }}
            >
                {t(`commands.${props.action}`)}
            </Button>
        </div>
    );
}

function AddPanel(props: { game: GameSerialized }) {
    const { t } = useTranslation();
    return (
        <div style={{ padding: '10px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            {COMMAND_GROUPS.map((group) => (
                <div key={group.titleKey} style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: group.color, marginBottom: '6px' }}>
                        {t(group.titleKey)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', minWidth: 0 }}>
                        {group.commands.map((action) => (
                            <DraggableOperator key={action} action={action} game={props.game} color={group.color} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AddPanel;
