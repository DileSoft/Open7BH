import {
    Button,
    Checkbox,
    Dialog, DialogTitle, DialogContent, MenuItem, Select, TextField,
} from '@mui/material';
import copy from 'copy-to-clipboard';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PixiCells from './PixiCells';
import PixiCodeEditor from './PixiCodeEditor';
import Cells from './Cells';
import { CoordinatesType } from './types';
import {
    parseCoordinates,
} from './Utils';
import Levels from './Classes/Levels';
import { trOption } from './tr';
import { getLevelTask } from './levelTranslations';
import Game, { GameSerialized } from './Classes/Game';
import Cell, { CellType } from './Classes/Cell';
import Box from './Classes/Box';
import Character from './Classes/Character';
import Empty from './Classes/Empty';
import Wall from './Classes/Wall';
import Hole from './Classes/Hole';
import Printer from './Classes/Printer';
import Shredder from './Classes/Shredder';

function Editor(props: {levels: GameSerialized[], reloadLevels: () => void}) {
    const { t } = useTranslation();
    const [game, setGame] = useState<GameSerialized>(() => {
        const newGame = new Game();
        newGame.deserialize(Levels.load(0));
        newGame.renderCallback = _game => setGame(_game);
        return newGame.serialize(true);
    });

    const [cellDialog, setCellDialog] = useState<CoordinatesType | boolean>(false);
    const selectedCell: Cell | undefined = game.object ? game.object.level.cells[cellDialog as CoordinatesType] : undefined;
    const [template, setTemplate] = useState(0);

    const levelStringify = game.object ? JSON.stringify(game.object.serialize(), null, 2) : '';

    return <div>
        <div>
            <Select variant="standard" value={template} onChange={e => setTemplate(parseInt(e.target.value as string))}>
                {props.levels.map((currentLevel, number) => <MenuItem key={number} value={number}>{getLevelTask(currentLevel)}</MenuItem>)}
            </Select>
            <Button onClick={() => {
                const _game = new Game();
                _game.deserialize(Levels.load(template));
                _game.renderCallback = _game => setGame(_game);
                _game.render();
            }}
            >
{t('editor.import')}
            </Button>
            <Button onClick={() => game.object && copy(JSON.stringify(game.object.level.serialize(false), null, 2))}>{t('editor.copyCells')}</Button>
            <Button onClick={() => game.object && copy(JSON.stringify(game.object.level.getCharacters(), null, 2))}>{t('editor.copyCharacters')}</Button>
            <Button onClick={() => copy(levelStringify)}>{t('editor.copyLevel')}</Button>
            <Button onClick={() => {
                if (game.object && game.name) {
                    Levels.save(game.name, game.object.serialize());
                    props.reloadLevels();
                }
            }}
            >
{t('editor.save')}
            </Button>
        </div>
        <div>
            <TextField
                label={t('editor.width')}
                value={game.level?.width}
                variant="standard"
                onChange={e => {
                    if (game.object && game.level) {
                        game.object.level.changeSize(parseInt(e.target.value), game.level.height);
                        game.object.render();
                    }
                }}
            />
            <TextField
                label={t('editor.height')}
                value={game.level?.height}
                variant="standard"
                onChange={e => {
                    if (game.object && game.level) {
                        game.object.level.changeSize(game.level.width, parseInt(e.target.value));
                        game.object.render();
                    }
                }}
            />
            <Button onClick={() => {
                if (game.object) {
                    game.object.level.crop(game.object.level.width, game.object.level.height);
                    game.object.render();
                }
            }}
            >
{t('editor.crop')}
            </Button>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
            <div>
                <h3>{t('editor.pixiCellsNew')}</h3>
                <PixiCells
                    game={game}
                />
            </div>
            <div>
                <h3>{t('editor.cellsOld')}</h3>
                <Cells
                    game={game}
                    onClick={(coordinates => setCellDialog(coordinates))}
                />
            </div>
            {/* <div>
                <h3>Pixi Code Editor</h3>
                <PixiCodeEditor
                    game={game}
                />
            </div> */}
        </div>
        <div>
            <pre>
                <div>
                    {levelStringify}
                </div>
                {/* <div>{JSON.stringify(game.object.level.serialize(false), null, 2)}</div> */}
                {/* <div>
                    {JSON.stringify(game.object.serialize(), (key, val) => {
                        if (typeof val === 'function') {
                            return `${val}`; // implicitly `toString` it
                        }
                        return val;
                    }, 2)}
                </div> */}
            </pre>
        </div>
        <Dialog open={cellDialog !== false} onClose={() => setCellDialog(false)}>
            <DialogTitle>{cellDialog}</DialogTitle>
            <DialogContent>
                <div>
                    <Select
                        value={selectedCell?.getType()}
                        onChange={e => {
                            if (!game.object) return;
                            const coordinates = parseCoordinates(cellDialog as CoordinatesType);
                            let cell: Cell | undefined;
                            if (e.target.value === CellType.Empty) {
                                cell = new Empty(game.object.level, coordinates[0], coordinates[1]);
                            }
                            if (e.target.value === CellType.Wall) {
                                cell = new Wall(game.object.level, coordinates[0], coordinates[1]);
                            }
                            if (e.target.value === CellType.Hole) {
                                cell = new Hole(game.object.level, coordinates[0], coordinates[1]);
                                cell.isEmpty = true;
                            }
                            if (e.target.value === CellType.Printer) {
                                cell = new Printer(game.object.level, coordinates[0], coordinates[1]);
                                cell.isEmpty = true;
                            }
                            if (e.target.value === CellType.Shredder) {
                                cell = new Shredder(game.object.level, coordinates[0], coordinates[1]);
                                cell.isEmpty = true;
                            }
                            if (cell) {
                                game.object.level.addCell(coordinates[0], coordinates[1], cell);
                            }
                            game.object.render();
                        }}
                    >
                        {Object.values(CellType).map(option =>
                            <MenuItem value={option} key={option}>{trOption('cellType', option)}</MenuItem>)}
                    </Select>
                </div>
                {selectedCell?.getType() === 'empty' ? <div>
{t('editor.item')}
                    {' '}
                    <Checkbox
                        checked={!!selectedCell?.item}
                        onChange={e => {
                            if (e.target.checked) {
                                selectedCell.setItem(new Box(0));
                            } else {
                                selectedCell.setItem(null);
                            }
                            game.object?.render();
                        }}
                    />
                </div> : null}
                {selectedCell?.item ? <div>
                    <TextField
                        label={t('editor.itemValue')}
                        value={selectedCell?.item?.value}
                        variant="standard"
                        onChange={e => {
                            if (selectedCell.item) {
                                selectedCell.item.value = parseInt(e.target.value) || 0;
                                game.object?.render();
                            }
                        }}
                    />
                </div> : null}
                {selectedCell?.getType() === 'empty' ? <div>
{t('editor.character')}
                    {' '}
                    <Checkbox
                        checked={!!selectedCell.character}
                        onChange={e => {
                            if (game.object && e.target.checked) {
                                selectedCell.setCharacter(
                                    new Character(selectedCell, `${game.object.level.getCharacters().length + 1}`),
                                );
                                if (selectedCell.character) {
                                    selectedCell.character.color = 'green';
                                }
                            } else {
                                selectedCell.character = null;
                            }
                            game.object?.render();
                        }}
                    />
                </div> : null}
            </DialogContent>
        </Dialog>
    </div>;
}

export default Editor;
