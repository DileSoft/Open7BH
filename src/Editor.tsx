import {
    Button,
    Checkbox,
    Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, List, ListItem, ListItemButton, ListItemText, MenuItem, Select, Switch, Tab, Tabs, TextField,
} from '@mui/material';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import RestoreOutlined from '@mui/icons-material/RestoreOutlined';
import copy from 'copy-to-clipboard';
import {
    ChangeEvent,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import PixiCells from './PixiCells';
import Cells from './Cells';
import LevelBadge from './LevelBadge';
import { CoordinatesType } from './types';
import {
    parseCoordinates,
} from './Utils';
import Levels from './Classes/Levels';
import { trOption } from './tr';
import { getLevelTask } from './levelTranslations';
import Game, { GameSerialized, LevelTranslations } from './Classes/Game';
import Cell, { CellType } from './Classes/Cell';
import Box from './Classes/Box';
import Character from './Classes/Character';
import Empty from './Classes/Empty';
import Wall from './Classes/Wall';
import Hole from './Classes/Hole';
import Printer from './Classes/Printer';
import Shredder from './Classes/Shredder';
import WinConditionsEditor from './WinConditionsEditor';
import { PixiRenderer } from './PixiRenderer';
import {
    createEmptyLevel,
    gameToTsModule,
    parseLevelJson,
    serializeLevelToJson,
} from './levelJson';

const CHARACTER_COLORS = ['red', 'green', 'yellow', 'blue', 'purple', 'orange', 'pink', 'cyan', 'white'];

// The app theme forces every TextField to 50px, so give the editor fields an
// explicit width via inline styles (they override the theme).
const FIELD_WIDTH: React.CSSProperties = { width: 200 };
const TASK_FIELD_WIDTH: React.CSSProperties = { width: 280 };
const SIZE_FIELD_WIDTH: React.CSSProperties = { width: 80 };
const CHAR_FIELD_WIDTH: React.CSSProperties = { width: 130 };

// Shared layout helpers for the cell dialog.
const DIALOG_SECTION: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid #e0e0e0' };
const DIALOG_SECTION_TITLE: React.CSSProperties = { fontSize: 13, fontWeight: 'bold', marginBottom: 8 };
const DIALOG_FIELD_ROW: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };

enum EditorTab {
    Level = 0,
    Code = 1,
}

function Editor(props: {levels: GameSerialized[], reloadLevels: () => void}) {
    const { t } = useTranslation();
    const [game, setGame] = useState<GameSerialized>(() => {
        const newGame = new Game();
        newGame.deserialize(Levels.load(0));
        newGame.renderCallback = _game => setGame(_game);
        return newGame.serialize(true);
    });

    const [activeTab, setActiveTab] = useState<EditorTab>(EditorTab.Level);
    const [showLegacyCells, setShowLegacyCells] = useState(false);
    const [loadDialogOpen, setLoadDialogOpen] = useState(false);
    const [cellDialog, setCellDialog] = useState<CoordinatesType | boolean>(false);
    const selectedCell: Cell | undefined = game.object ? game.object.level.cells[cellDialog as CoordinatesType] : undefined;
    const [codeDraft, setCodeDraft] = useState('');
    const [codeError, setCodeError] = useState<string | null>(null);
    const codeAppliedRef = useRef('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const levelStringify = game.object ? JSON.stringify(game.object.serialize(), null, 2) : '';

    // Keep the "starting code" textarea in sync when the live game code changes
    // elsewhere (e.g. a different level was imported) without clobbering a user
    // edit that is still in progress (invalid JSON = not yet applied).
    useEffect(() => {
        if (game.object) {
            const json = JSON.stringify(game.object.serialize(false).code, null, 2);
            if (json !== codeAppliedRef.current) {
                codeAppliedRef.current = json;
                setCodeDraft(json);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game]);

    // ---- Loading / saving -------------------------------------------------

    const loadLevel = (level: GameSerialized) => {
        const _game = new Game();
        _game.deserialize(level);
        _game.renderCallback = _game => setGame(_game);
        _game.render();
    };

    const newLevel = () => {
        const _game = new Game();
        _game.deserialize(createEmptyLevel());
        _game.renderCallback = _game => setGame(_game);
        _game.render();
    };

    const saveLevel = () => {
        if (!game.object) return;
        let name = game.name;
        if (!name) {
            // A new level has no name yet — ask the user for one.
            name = (window.prompt(t('editor.namePrompt'), t('editor.newLevelDefaultName')) ?? '').trim();
            if (!name) return;
            game.object.name = name;
        }
        Levels.saveUserLevel(game.object.serialize());
        props.reloadLevels();
    };

    const removeLevel = (level: GameSerialized) => {
        if (!window.confirm(t('editor.confirmDelete', { name: level.name }))) return;
        Levels.remove(level.name);
        props.reloadLevels();
    };

    const restoreLevel = (level: GameSerialized) => {
        Levels.restoreOriginal(level.name);
        props.reloadLevels();
    };

    const resetLevel = () => {
        if (!game || !game.name) return;
        Levels.restoreOriginal(game.name);
        loadLevel(Levels.load(game.name));
        props.reloadLevels();
    };

    const isCurrentModified = !!game.name
        && Levels.isSystemName(game.name)
        && !!Levels.getMeta(game.name)?.modified;

    // ---- Level properties -------------------------------------------------

    const ensureTranslations = () => {
        if (!game.object || game.object.translations) return;
        game.object.translations = {
            task: { en: game.object.level.task, ru: game.object.level.task },
            characterNames: {},
        };
    };

    const setName = (value: string) => {
        if (game.object) {
            game.object.name = value;
            game.object.render();
        }
    };

    const setTask = (lang: 'en' | 'ru', value: string) => {
        if (!game.object) return;
        ensureTranslations();
        if (game.object.translations) game.object.translations.task[lang] = value;
        if (lang === 'en') game.object.level.task = value;
        game.object.render();
    };

    const setSize = (width: number, height: number) => {
        if (game.object && game.level) {
            game.object.level.changeSize(width, height);
            PixiRenderer.getInstance().resize(width, height);
            game.object.render();
        }
    };

    // ---- Characters (edited inside the cell dialog) -----------------------

    const setCharacterName = (character: Character, value: string) => {
        if (!game.object) return;
        ensureTranslations();
        const oldName = character.name;
        character.name = value;
        const names = game.object.translations?.characterNames;
        if (names && names[oldName]) {
            names[value] = names[oldName];
            delete names[oldName];
        }
        game.object.render();
    };

    const setCharacterColor = (character: Character, value: string) => {
        character.color = value;
        game.object?.render();
    };

    const setCharacterTranslation = (character: Character, lang: 'en' | 'ru', value: string) => {
        if (!game.object) return;
        ensureTranslations();
        const translations = game.object.translations as LevelTranslations;
        if (!translations.characterNames[character.name]) {
            translations.characterNames[character.name] = { en: character.name, ru: character.name };
        }
        translations.characterNames[character.name][lang] = value;
        game.object.render();
    };

    // ---- Export / import from file ----------------------------------------

    const downloadJson = () => {
        if (!game.object) return;
        const json = serializeLevelToJson(game.object);
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${(json.name || 'level').replace(/[^\w\d-]+/g, '_')}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    };

    const copyJson = () => {
        if (game.object) copy(JSON.stringify(serializeLevelToJson(game.object), null, 2));
    };

    const copyTs = () => {
        if (game.object) copy(gameToTsModule(game.object));
    };

    const onLoadJson = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            const _game = new Game();
            _game.deserialize(parseLevelJson(json));
            _game.renderCallback = _game => setGame(_game);
            _game.render();
        } catch (err) {
            console.error('Failed to load JSON level', err);
        }
        event.target.value = '';
    };

    const onCodeChange = (value: string) => {
        setCodeDraft(value);
        try {
            const parsed = JSON.parse(value);
            if (game.object) {
                game.object.deserializeCode(parsed);
                codeAppliedRef.current = JSON.stringify(game.object.serialize(false).code, null, 2);
                game.object.render();
                setCodeError(null);
            }
        } catch (e) {
            setCodeError(String(e));
        }
    };

    return <div>
        {/* ---- Toolbar: what is being edited, load / save / export ---- */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>{t('editor.editing')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <LevelBadge name={game.name} />
                <b>{game.name || t('editor.unnamed')}</b>
            </span>
            <span style={{ opacity: 0.7, whiteSpace: 'nowrap' }}>— {getLevelTask(game)}</span>
            <span style={{ flex: 1 }} />
            <Button onClick={() => setLoadDialogOpen(true)}>{t('editor.load')}</Button>
            <Button onClick={newLevel}>{t('editor.newLevel')}</Button>
            <Button onClick={saveLevel}>{t('editor.save')}</Button>
            {isCurrentModified ? <Button onClick={resetLevel}>{t('editor.reset')}</Button> : null}
            <Button onClick={downloadJson}>{t('editor.downloadJson')}</Button>
            <Button onClick={copyJson}>{t('editor.copyJson')}</Button>
            <Button onClick={copyTs}>{t('editor.copyTs')}</Button>
            <Button onClick={() => fileInputRef.current?.click()}>{t('editor.loadJson')}</Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={onLoadJson}
            />
        </div>

        {/* ---- Field (always visible) + tabs to the right ---- */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', marginTop: 8 }}>
            <div style={{ flexShrink: 0 }}>
                <h3>{t('editor.pixiCellsNew')}</h3>
                <PixiCells
                    game={game}
                    onCellClick={(x, y) => setCellDialog(`${x}x${y}`)}
                />
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{t('editor.pixiHint')}</div>
                <FormControlLabel
                    control={<Switch checked={showLegacyCells} onChange={e => setShowLegacyCells(e.target.checked)} />}
                    label={t('editor.toggleOldCells')}
                />
                {showLegacyCells ? <div>
                    <h3>{t('editor.cellsOld')}</h3>
                    <Cells
                        game={game}
                        onClick={(coordinates => setCellDialog(coordinates))}
                    />
                </div> : null}
            </div>

            <div style={{ flex: 1, minWidth: 460, maxWidth: 950, paddingTop: 4 }}>
                <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value as EditorTab)}>
                    <Tab label={t('editor.tab.level')} />
                    <Tab label={t('editor.tab.code')} />
                </Tabs>

                {activeTab === EditorTab.Level ? <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <h3>{t('editor.properties')}</h3>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <TextField
                                label={t('editor.name')}
                                value={game.name}
                                variant="standard"
                                style={FIELD_WIDTH}
                                onChange={e => setName(e.target.value)}
                            />
                            <TextField
                                label={t('editor.taskEn')}
                                value={game.level?.task}
                                variant="standard"
                                style={TASK_FIELD_WIDTH}
                                onChange={e => setTask('en', e.target.value)}
                            />
                            <TextField
                                label={t('editor.taskRu')}
                                value={game.object?.translations?.task?.ru ?? ''}
                                variant="standard"
                                style={TASK_FIELD_WIDTH}
                                onChange={e => setTask('ru', e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
                            <TextField
                                label={t('editor.width')}
                                value={game.level?.width}
                                variant="standard"
                                type="number"
                                style={SIZE_FIELD_WIDTH}
                                onChange={e => {
                                    const width = parseInt(e.target.value, 10);
                                    if (game.level && !Number.isNaN(width) && width > 0) {
                                        setSize(width, game.level.height);
                                    }
                                }}
                            />
                            <TextField
                                label={t('editor.height')}
                                value={game.level?.height}
                                variant="standard"
                                type="number"
                                style={SIZE_FIELD_WIDTH}
                                onChange={e => {
                                    const height = parseInt(e.target.value, 10);
                                    if (game.level && !Number.isNaN(height) && height > 0) {
                                        setSize(game.level.width, height);
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
                    </div>
                    <div>
                        <h3>{t('editor.winConditions')}</h3>
                        <WinConditionsEditor game={game} />
                    </div>
                </div> : null}

                {activeTab === EditorTab.Code ? <div style={{ marginTop: 8 }}>
                    <TextField
                        label={t('editor.code')}
                        variant="standard"
                        multiline
                        fullWidth
                        minRows={6}
                        value={codeDraft}
                        onChange={e => onCodeChange(e.target.value)}
                        error={!!codeError}
                        helperText={codeError ?? undefined}
                    />
                    <pre>
                        <div>
                            {levelStringify}
                        </div>
                    </pre>
                </div> : null}
            </div>
        </div>

        {/* ---- Load level dialog ---- */}
        <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>{t('editor.loadLevel')}</DialogTitle>
            <DialogContent dividers>
                <List dense>
                    {props.levels.map((currentLevel, number) => {
                        const meta = Levels.getMeta(currentLevel.name);
                        const isSystem = meta ? meta.isSystem : Levels.isSystemName(currentLevel.name);
                        const isModified = !!meta?.modified;
                        return <ListItem
                            key={number}
                            disablePadding
                            secondaryAction={isSystem
                                ? (isModified
                                    ? <IconButton
                                        size="small"
                                        title={t('editor.resetSystemLevel')}
                                        onClick={() => restoreLevel(currentLevel)}
                                    >
                                        <RestoreOutlined fontSize="small" />
                                    </IconButton>
                                    : null)
                                : <IconButton
                                    size="small"
                                    title={t('editor.deleteLevel')}
                                    onClick={() => removeLevel(currentLevel)}
                                >
                                    <DeleteOutlined fontSize="small" />
                                </IconButton>}
                        >
                            <ListItemButton
                                selected={currentLevel.name === game.name}
                                onClick={() => {
                                    loadLevel(currentLevel);
                                    setLoadDialogOpen(false);
                                }}
                            >
                                <LevelBadge name={currentLevel.name} />
                                <ListItemText
                                    primary={getLevelTask(currentLevel)}
                                    secondary={currentLevel.name}
                                />
                                {currentLevel.name === game.name
                                    ? <span style={{ color: '#2e7d32', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t('editor.editingNow')}</span>
                                    : null}
                            </ListItemButton>
                        </ListItem>;
                    })}
                </List>
            </DialogContent>
        </Dialog>

        {/* ---- Cell dialog (React, opened by clicking a cell) ---- */}
        <Dialog open={cellDialog !== false} onClose={() => setCellDialog(false)} fullWidth maxWidth="sm">
            <DialogTitle>{cellDialog}</DialogTitle>
            <DialogContent>
                {/* Cell type */}
                <div style={DIALOG_SECTION}>
                    <div style={DIALOG_SECTION_TITLE}>{t('editor.typeLabel')}</div>
                    <Select
                        variant="standard"
                        fullWidth
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

                {/* Box on the cell */}
                {selectedCell?.getType() === 'empty' ? <div style={DIALOG_SECTION}>
                    <FormControlLabel
                        control={<Checkbox
                            checked={!!selectedCell.item}
                            onChange={e => {
                                if (e.target.checked) {
                                    selectedCell.setItem(new Box(0));
                                } else {
                                    selectedCell.setItem(null);
                                }
                                game.object?.render();
                            }}
                        />}
                        label={t('editor.itemEnabled')}
                    />
                    {selectedCell?.item ? <div style={DIALOG_FIELD_ROW}>
                        <TextField
                            label={t('editor.itemValue')}
                            value={selectedCell?.item?.value}
                            variant="standard"
                            style={SIZE_FIELD_WIDTH}
                            onChange={e => {
                                if (selectedCell.item) {
                                    selectedCell.item.value = parseInt(e.target.value) || 0;
                                    game.object?.render();
                                }
                            }}
                        />
                        <TextField
                            label={t('editor.tag')}
                            value={selectedCell?.item?.tag ?? ''}
                            variant="standard"
                            style={CHAR_FIELD_WIDTH}
                            onChange={e => {
                                if (selectedCell.item) {
                                    selectedCell.item.tag = e.target.value || null;
                                    game.object?.render();
                                }
                            }}
                        />
                        <FormControlLabel
                            control={<Checkbox
                                checked={!!selectedCell.item.isRandom}
                                onChange={e => {
                                    if (selectedCell.item) {
                                        selectedCell.item.isRandom = e.target.checked;
                                        game.object?.render();
                                    }
                                }}
                            />}
                            label={t('editor.random')}
                        />
                    </div> : null}
                </div> : null}

                {/* Printer */}
                {selectedCell instanceof Printer ? <div style={DIALOG_SECTION}>
                    <div style={DIALOG_SECTION_TITLE}>{t('editor.printer')}</div>
                    <div style={DIALOG_FIELD_ROW}>
                        <TextField
                            label={t('editor.printerMin')}
                            value={selectedCell.min}
                            variant="standard"
                            type="number"
                            style={SIZE_FIELD_WIDTH}
                            onChange={e => {
                                selectedCell.min = parseInt(e.target.value) || 0;
                                game.object?.render();
                            }}
                        />
                        <TextField
                            label={t('editor.printerMax')}
                            value={selectedCell.max}
                            variant="standard"
                            type="number"
                            style={SIZE_FIELD_WIDTH}
                            onChange={e => {
                                selectedCell.max = parseInt(e.target.value) || 0;
                                game.object?.render();
                            }}
                        />
                        <TextField
                            label={t('editor.printerFixed')}
                            value={selectedCell.fixedValue ?? ''}
                            variant="standard"
                            type="number"
                            style={SIZE_FIELD_WIDTH}
                            onChange={e => {
                                const parsed = parseInt(e.target.value, 10);
                                selectedCell.fixedValue = Number.isNaN(parsed) ? undefined : parsed;
                                game.object?.render();
                            }}
                        />
                    </div>
                </div> : null}

                {/* Character on the cell */}
                {selectedCell?.getType() === 'empty' ? <div style={{ padding: '12px 0' }}>
                    <FormControlLabel
                        control={<Checkbox
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
                        />}
                        label={t('editor.characterEnabled')}
                    />
                    {selectedCell?.getType() === 'empty' && selectedCell.character ? <div style={DIALOG_FIELD_ROW}>
                        <TextField
                            label={t('editor.characterName')}
                            value={selectedCell.character.name}
                            variant="standard"
                            style={CHAR_FIELD_WIDTH}
                            onChange={e => setCharacterName(selectedCell.character, e.target.value)}
                        />
                        <Select
                            variant="standard"
                            value={selectedCell.character.color}
                            style={{ minWidth: 90 }}
                            onChange={e => setCharacterColor(selectedCell.character, e.target.value as string)}
                        >
                            {CHARACTER_COLORS.map(color =>
                                <MenuItem key={color} value={color}><span style={{ color }}>{color}</span></MenuItem>)}
                        </Select>
                        <TextField
                            label={t('editor.characterNamesEn')}
                            value={game.object?.translations?.characterNames?.[selectedCell.character.name]?.en ?? selectedCell.character.name}
                            variant="standard"
                            style={CHAR_FIELD_WIDTH}
                            onChange={e => setCharacterTranslation(selectedCell.character, 'en', e.target.value)}
                        />
                        <TextField
                            label={t('editor.characterNamesRu')}
                            value={game.object?.translations?.characterNames?.[selectedCell.character.name]?.ru ?? selectedCell.character.name}
                            variant="standard"
                            style={CHAR_FIELD_WIDTH}
                            onChange={e => setCharacterTranslation(selectedCell.character, 'ru', e.target.value)}
                        />
                    </div> : null}
                </div> : null}
            </DialogContent>
        </Dialog>
    </div>;
}

export default Editor;