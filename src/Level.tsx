import { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import copy from 'copy-to-clipboard';
import { arrayMoveImmutable } from 'array-move';
import {
    Button, Grid, TextField,
} from '@mui/material';
import ManIcon from '@mui/icons-material/Man';
import {
    moveCoordinates, parseCoordinates, randomArray, clone, getRandomInt,
} from './Utils';
import {
    CharacterType, CoordinatesType, LevelType, LineForEachType, LineType, StepDirection, ValueDirectionType, ValueNumberType, ValuePrinterType,
} from './types';
import Cells from './Cells';
import AddPanel from './AddPanel';
import renderLine from './renderLine';
import Game, { GameSerialized, GameState } from './Classes/Game';
import { LevelSerializedType } from './Classes/Level';
import { CellType } from './Classes/Cell';

const SortableItem = sortableElement(({ children }) => <div>{children}</div>);

const SortableContainer = sortableContainer(({ children }) => <div>{children}</div>);

function Level(props: {level: LevelSerializedType, levelNumber: number}) {
    const [game, setGame] = useState<GameSerialized>();

    useEffect(() => {
        const gameObject = new Game();
        gameObject.deserialize({ level: props.level });
        gameObject.renderCallback = setGame;
        console.log(gameObject.level.findNear([0, 0], CellType.Printer));
        gameObject.render();
    }, [props.level]);

    console.log(game);

    let intend = 0;

    const renderLines = useMemo(() => {
        if (!game) {
            return [];
        }
        return game.code.map((line, key) => {
            const lineResult = renderLine(line, key, game, intend);
            intend = lineResult.intend;
            return lineResult.result;
        });
    }, [game?.code]);

    if (!game) {
        return null;
    }

    return <Grid container>
        <Grid item md={6}>
            <h2>{game.level.task}</h2>
            <h4>{game.state === GameState.Run && game.level.winCallback(game.level.object) ? 'Win' : null}</h4>
            <Cells
                game={game}
            />
        </Grid>
        <Grid item md={1}>
            <AddPanel game={game} />
        </Grid>
        <Grid item md={5}>
            <div style={{ paddingLeft: 20 }}>
                <SortableContainer onSortEnd={({ oldIndex, newIndex }, e) => {
                    if (e.ctrlKey) {
                        // const newCode = clone(code);
                        // newCode.splice(newIndex, 0, code[oldIndex]);
                        // setCode(newCode);
                    } else {
                        game.object.moveOperator(oldIndex, newIndex);
                        game.object.render();
                    }
                }}
                >
                    {game.code.map((line, key) => {
                        const result = <SortableItem index={key} key={key}>
                            {game.object.level.getCharacters().filter(character => character.currentLine === key).map(character => <span key={character.name}>
                                <ManIcon fontSize="small" style={{ color: character.color }} />
                            </span>)}
                            {renderLines[key]}
                        </SortableItem>;
                        return result;
                    })}
                </SortableContainer>
                <div style={{ paddingTop: 20 }}>
Speed:
                    {' '}
                    <TextField
                        variant="standard"
                        type="number"
                        value={1000 / game.speed}
                        onChange={e => {
                            game.object.speed = 1000 / (parseInt(e.target.value) || 1);
                            game.object.render();
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    <div>
                        <Button
                            variant="contained"
                            onClick={() => {
                                game.object.deserialize({ level: props.level });
                                game.object.render();
                                game.object.state === GameState.Run ? game.object.stop() : game.object.start();
                            }}
                            disabled={intend !== 0}
                        >
                            {game.object.state === GameState.Run ? 'Stop' : 'Run'}
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            onClick={() => copy(JSON.stringify(game.object.serialize(), null, 2))}
                        >
Copy
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            onClick={() => {
                                // window.localStorage.setItem(`level${props.levelNumber}`, JSON.stringify(props.level.code));
                                // setCode(props.level.code);
                            }}
                        >
Clear
                        </Button>
                    </div>
                </div>
                {game.object.level.getCharacters().map(character => <div key={character.name}>
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
                    {JSON.stringify(Object.values(game.object.level.cells).filter(cell => cell.character)
                        .map(cell => ({
                            name: cell.character?.name, line: cell.character.currentLine, x: cell.x, y: cell.y,
                        })), null, 2)}
                </pre>
            </div>
        </Grid>
    </Grid>;
}

export default Level;
