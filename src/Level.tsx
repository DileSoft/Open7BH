import { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { useDrop } from 'react-dnd';
import copy from 'copy-to-clipboard';
import {
    Button, TextField,
} from '@mui/material';
import ManIcon from '@mui/icons-material/Man';
import { useTranslation } from 'react-i18next';
import Cells from './Cells';
import AddPanel from './AddPanel';
import renderLine from './renderLine';
import Game, { GameSerialized, GameState } from './Classes/Game';
import { LevelSerializedType } from './Classes/Level';
import PixiCells from './PixiCells';
import { OperatorType } from './Classes/Operators/Operator';
import { getLevelTask, getCharacterName } from './levelTranslations';

const SortableItem = sortableElement(({ children, index }: { children: React.ReactNode, index: number }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'OPERATOR',
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), []);

    return <div ref={drop as any} style={{ borderTop: isOver ? '2px solid green' : 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>{children}</div>;
});

const SortableContainer = sortableContainer(({ children }: { children: React.ReactNode }) => <div className="sortable-code" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>{children}</div>);

// Dragging a code line must not start when interacting with controls/inputs inside it,
// and moving lines must not select their text.
const shouldCancelSortStart = (e: any) => {
    const target = e.target as HTMLElement | null;
    if (!target || !target.tagName) return false;
    const tag = target.tagName.toUpperCase();
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'SVG', 'PATH'].includes(tag)) return true;
    if (target.closest && target.closest('input,textarea,select,button,a,[contenteditable="true"],.MuiPopover-root,.MuiMenu-root,.MuiSelect-select')) return true;
    return false;
};

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
    const { t, i18n } = useTranslation();
    const [game, setGame] = useState<GameSerialized>();
    const [showLegacyCells, setShowLegacyCells] = useState(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game, i18n.language]);

    if (!game) {
        return null;
    }

    return <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <h2>{getLevelTask(props.level)}</h2>
            <h4>{game.won ? t('level.win') : null}</h4>
            <h4>{game.lost ? `${t('level.lost')}${game.loseReason ? `: ${game.loseReason}` : ''}` : null}</h4>
            <div style={{ display: 'flex', gap: '20px' }}>
                {showLegacyCells &&
                    <div>
                        <h3>{t('level.cellsOld')}</h3>
                        <Cells
                            game={game}
                        />
                    </div>}
                <div>
                    <h3>{t('level.pixiNew')}</h3>
                    <div>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setShowLegacyCells(value => !value)}
                        >
                            {showLegacyCells ? t('level.hideOld') : t('level.showOld')}
                        </Button>
                    </div>
                    {game && <PixiCells
                        game={game}
                    />}
                </div>
            </div>
        </div>
        <div style={{ flex: '0 0 280px', minWidth: 0 }}>
            <AddPanel game={game} />
        </div>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <div style={{ paddingLeft: 20 }}>
                <h3>{t('level.codeOld')}</h3>
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
                shouldCancelStart={shouldCancelSortStart}
                helperClass="sortable-code-helper"
                >
                    {(game.code || []).map((line, key) => {
                        const result = <div key={line.object?.id} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
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
{t('level.speed')}
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
                            {game.object?.state === GameState.Run ? t('level.stop') : t('level.run')}
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            onClick={() => game.object && copy(JSON.stringify(game.object.serialize(), null, 2))}
                        >
{t('level.copy')}
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
{t('level.clear')}
                        </Button>
                    </div>
                </div>
                {game.object?.level.getCharacters().map(character => <div key={character.name}>
                    {getCharacterName(character.name, props.level.name)}
                    {' '}
                    <span style={{ color: character.color }}>
                        <ManIcon fontSize="small" />
                    </span>
                    {' '}
                    {character.slots?.map((slot, key) => {
                        const box = slot.getBox();
                        const cell = slot.getCellValue();
                        const worker = slot.getCharacterValue();
                        const num = slot.getNumberValue();
                        const label: string = slot.isNothing()
                            ? t('level.nothing')
                            : worker
                                ? `worker:${worker.name}`
                                : box
                                    ? `box:${box.value}`
                                    : cell
                                        ? `cell:${cell.x},${cell.y}${cell.item && !cell.item.destroyed ? `=${cell.item.value}` : ''}`
                                        : num !== undefined ? String(num) : t('level.nothing');
                        return <span key={key} title={label}>
                            {label}
                            {' '}
                        </span>;
                    })}
                </div>)}
                <pre>
                    {game.object && JSON.stringify(Object.values(game.object.level.cells).filter(cell => cell.character)
                        .map(cell => ({
                            name: cell.character?.name, line: cell.character?.currentLine, x: cell.x, y: cell.y,
                        })), null, 2)}
                </pre>
            </div>
        </div>
    </div>;
}

export default Level;
