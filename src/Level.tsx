import { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { useDrop } from 'react-dnd';
import copy from 'copy-to-clipboard';
import {
    Button, Grid, TextField,
} from '@mui/material';
import ManIcon from '@mui/icons-material/Man';
import Cells from './Cells';
import AddPanel from './AddPanel';
import renderLine from './renderLine';
import Game, { GameSerialized, GameState } from './Classes/Game';
import { LevelSerializedType } from './Classes/Level';
import PixiCells from './PixiCells';
import PixiCodeEditor from './PixiCodeEditor';
import { OperatorType } from './Classes/Operators/Operator';

const SortableItem = sortableElement(({ children, index }: { children: React.ReactNode, index: number }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'OPERATOR',
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), []);

    return <div ref={drop as any} style={{ borderTop: isOver ? '2px solid green' : 'none' }}>{children}</div>;
});

const SortableContainer = sortableContainer(({ children }: { children: React.ReactNode }) => <div>{children}</div>);

function CodeDropZone(props: { index: number, game: GameSerialized, isLast?: boolean }) {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: 'OPERATOR',
        drop: (item: { action: OperatorType }) => {
            if (props.game.object) {
                props.game.object.addOperator(item.action, props.index);
                props.game.object.render();
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }), [props.game, props.index]);

    return (
        <div
            ref={drop as any}
            style={{
                height: isOver ? '40px' : (canDrop ? '20px' : '4px'),
                backgroundColor: isOver ? 'rgba(0, 255, 0, 0.3)' : (canDrop ? 'rgba(0, 255, 0, 0.1)' : 'transparent'),
                transition: 'all 0.2s',
                width: '100%',
                border: canDrop ? '1px dashed green' : 'none',
                boxSizing: 'border-box',
            }}
        />
    );
}

function Level(props: {level: GameSerialized, levelNumber: number}) {
    const [game, setGame] = useState<GameSerialized>();

    useEffect(() => {
        const gameObject = new Game();
        gameObject.deserialize(props.level);
        gameObject.renderCallback = setGame;
        const storedCode = window.localStorage.getItem(`level${props.levelNumber}`);
        gameObject.deserializeCode((storedCode ? JSON.parse(storedCode) : []) as GameSerialized['code']);
        gameObject.render();
    }, [props.level]);

    useEffect(() => {
        if (game?.object) {
            window.localStorage.setItem(`level${props.levelNumber}`, JSON.stringify(game.object.serialize().code));
        }
    }, [game, props.levelNumber]);

    let intend = 0;

    const renderLines = useMemo(() => {
        if (!game || !game.code) {
            return [];
        }
        let currentIntend = 0;
        return game.code.map((line, key) => {
            const lineResult = renderLine(line, key, game, currentIntend);
            currentIntend = lineResult.intend;
            return lineResult.result;
        });
    }, [game]);

    if (!game) {
        return null;
    }

    return <Grid container>
        <Grid item md={6}>
            <h2>{game.level?.task}</h2>
            <h4>{game.state === GameState.Run && game.level && game.level.winCallback(game.level.object as any) ? 'Win' : null}</h4>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                    <h3>Cells (Old)</h3>
                    <Cells
                        game={game}
                    />
                </div>
                <div>
                    <h3>PixiJS (New)</h3>
                    {game && <PixiCells
                        game={game}
                    />}
                </div>
            </div>
        </Grid>
        <Grid item md={1}>
            <AddPanel game={game} />
        </Grid>
        <Grid item md={3}>
            <div style={{ paddingLeft: 20 }}>
                <h3>Code (Old)</h3>
                <SortableContainer onSortEnd={({ oldIndex, newIndex }: { oldIndex: number, newIndex: number }, e: any) => {
                    if (e.ctrlKey) {
                        // const newCode = clone(code);
                        // newCode.splice(newIndex, 0, code[oldIndex]);
                        // setCode(newCode);
                    } else if (game.object) {
                        game.object.moveOperator(oldIndex, newIndex);
                        game.object.render();
                    }
                }}
                >
                    {(game.code || []).map((line, key) => {
                        const result = <div key={line.object?.id}>
                            <CodeDropZone index={key} game={game} />
                            <SortableItem index={key}>
                                {game.object?.level.getCharacters().filter(character => character.currentLine === key).map(character => <span key={character.name}>
                                    <ManIcon fontSize="small" style={{ color: character.color }} />
                                </span>)}
                                {renderLines[key]}
                            </SortableItem>
                        </div>;
                        return result;
                    })}
                    <CodeDropZone index={(game.code || []).length} game={game} isLast />
                </SortableContainer>
                <div style={{ paddingTop: 20 }}>
Speed:
                    {' '}
                    <TextField
                        variant="standard"
                        type="number"
                        value={game.speed ? 1000 / game.speed : 0}
                        onChange={e => {
                            const val = parseInt(e.target.value) || 1;
                            const clampedVal = Math.min(Math.max(val, 1), 60); // Clamp speed between 1 and 60
                            if (game.object) {
                                game.object.speed = 1000 / clampedVal;
                                game.object.render();
                            }
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    <div>
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (game.object && props.level.level) {
                                    game.object.level.deserialize(props.level.level);
                                    game.object.render();
                                    game.object.state === GameState.Run ? game.object.stop() : game.object.start();
                                }
                            }}
                            disabled={intend !== 0}
                        >
                            {game.object?.state === GameState.Run ? 'Stop' : 'Run'}
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            onClick={() => game.object && copy(JSON.stringify(game.object.serialize(), null, 2))}
                        >
Copy
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (game.object && props.level.code) {
                                    game.object.deserializeCode(props.level.code);
                                    game.object.render();
                                }
                            }}
                        >
Clear
                        </Button>
                    </div>
                </div>
                {game.object?.level.getCharacters().map(character => <div key={character.name}>
                    {character.name}
                    {' '}
                    <span style={{ color: character.color }}>
                        <ManIcon fontSize="small" />
                    </span>
                    {' '}
                    {character.slots?.map((slot, key) => <span key={key}>
                        {slot.getNumberValue()}
                        {' '}
                    </span>)}
                </div>)}
                <pre>
                    {game.object && JSON.stringify(Object.values(game.object.level.cells).filter(cell => cell.character)
                        .map(cell => ({
                            name: cell.character?.name, line: cell.character?.currentLine, x: cell.x, y: cell.y,
                        })), null, 2)}
                </pre>
            </div>
        </Grid>
        {/* <Grid item md={2}>
            <div>
                <h3>Code (Pixi)</h3>
                <PixiCodeEditor game={game} />
            </div>
        </Grid> */}
    </Grid>;
}

export default Level;
