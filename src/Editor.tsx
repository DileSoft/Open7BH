import {
    Button,
    Checkbox,
    Dialog, DialogTitle, DialogContent, MenuItem, Select, TextField,
} from '@mui/material';
import copy from 'copy-to-clipboard';
import { useState } from 'react';
import Cells from './Cells';
import { CellTypeType, CoordinatesType, LevelType } from './types';
import {
    cellsStringify, clone, parseCells, parseCoordinates,
} from './Utils';
import levels from './levelsList';

function Editor(props) {
    const [level, setLevel] = useState<LevelType>({
        cells: parseCells('empty'),
        code: [],
        characters: [],
        height: 1,
        width: 1,
        task: '',
        win: (cells, characters) => false,
    });

    const [cellDialog, setCellDialog] = useState<CoordinatesType | boolean>(false);
    const selectedCell = level.cells[cellDialog as CoordinatesType];
    const [template, setTemplate] = useState(0);

    const changeSize = (newWidth: number, newHeight: number) => {
        const newLevel = clone(level);
        for (let x = 0; x < newWidth; x++) {
            for (let y = 0; y < newHeight; y++) {
                if (!newLevel.cells[`${x}x${y}`]) {
                    newLevel.cells[`${x}x${y}`] = {
                        type: 'nothing',
                    };
                }
            }
        }
        newLevel.width = newWidth;
        newLevel.height = newHeight;
        setLevel(newLevel);
    };

    const levelStringify = `{
        task: ${JSON.stringify(level.task)},
        code: [],
        cells: \`${cellsStringify(level.cells)}\`,
        characters: ${JSON.stringify(level.characters, null, 2)},
        width: ${level.width},
        height: ${level.height},
        win: ${level.win?.toString() || 'null'}
    }`;

    return <div>
        <div>
            <Select variant="standard" value={template} onChange={e => setTemplate(parseInt(e.target.value as string))}>
                {levels.map((currentLevel, number) => <MenuItem key={number} value={number}>{currentLevel.task}</MenuItem>)}
            </Select>
            <Button onClick={() => setLevel(levels[template])}>Import</Button>
        </div>
        <div>
            <TextField
                label="width"
                value={level.width}
                variant="standard"
                onChange={e => changeSize(parseInt(e.target.value), level.height)}
            />
            <TextField
                label="height"
                value={level.height}
                variant="standard"
                onChange={e => changeSize(level.width, parseInt(e.target.value))}
            />
            <Button onClick={() => {
                const newLevel = clone(level);
                Object.keys(newLevel.cells).forEach(coordinates => {
                    const coordinatesArray = parseCoordinates(coordinates);
                    if (coordinatesArray[0] > newLevel.width - 1 || coordinatesArray[1] > newLevel.height - 1) {
                        delete newLevel.cells[coordinates];
                    }
                });
                setLevel(newLevel);
            }}
            >
Crop
            </Button>
        </div>
        <Cells
            cells={level.cells}
            characters={level.characters}
            width={level.width}
            height={level.height}
            run={false}
            speed={0}
            onClick={(coordinates => setCellDialog(coordinates))}
        />
        <div>
            <div>
                <Button onClick={() => copy(cellsStringify(level.cells))}>Copy cells</Button>
                <Button onClick={() => copy(JSON.stringify(level.characters, null, 2))}>Copy characters</Button>
                <Button onClick={() => copy(levelStringify)}>Copy level</Button>
            </div>
            <pre>
                <div>
                    {levelStringify}
                </div>
                <div>{cellsStringify(level.cells)}</div>
                <div>
                    {JSON.stringify(level, (key, val) => {
                        if (typeof val === 'function') {
                            return `${val}`; // implicitly `toString` it
                        }
                        return val;
                    }, 2)}
                </div>
            </pre>
        </div>
        <Dialog open={cellDialog !== false} onClose={() => setCellDialog(false)}>
            <DialogTitle>{cellDialog}</DialogTitle>
            <DialogContent>
                <div>
                    <Select
                        value={selectedCell?.type}
                        onChange={e => {
                            const newLevel = clone(level);
                            newLevel.cells[cellDialog as CoordinatesType].type = e.target.value as CellTypeType;
                            setLevel(newLevel);
                        }}
                    >
                        {['nothing', 'empty', 'printer', 'shredder', 'wall'].map(option =>
                            <MenuItem value={option} key={option}>{option}</MenuItem>)}
                    </Select>
                </div>
                {selectedCell?.type === 'empty' ? <div>
Item:
                    {' '}
                    <Checkbox
                        checked={!!selectedCell?.item}
                        onChange={e => {
                            const newLevel = clone(level);
                            newLevel.cells[cellDialog as CoordinatesType].item = e.target.checked ? { type: 'box', value: 0 } : null;
                            setLevel(newLevel);
                        }}
                    />
                </div> : null}
                {selectedCell?.item ? <div>
                    <TextField
                        label="Item value"
                        value={selectedCell?.item?.value}
                        variant="standard"
                        onChange={e => {
                            const newLevel = clone(level);
                            newLevel.cells[cellDialog as CoordinatesType].item.value = parseInt(e.target.value);
                            setLevel(newLevel);
                        }}
                    />
                </div> : null}
                {selectedCell?.type === 'empty' ? <div>
Character:
                    {' '}
                    <Checkbox
                        checked={!!level.characters.find(character => character.coordinates === cellDialog)}
                        onChange={e => {
                            const newLevel = clone(level);
                            if (e.target.checked) {
                                newLevel.characters.push({
                                    color: 'green',
                                    name: `${newLevel.characters.length + 1}`,
                                    step: -1,
                                    coordinates: cellDialog as CoordinatesType,
                                });
                            } else {
                                newLevel.characters.splice(newLevel.characters.findIndex(character => character.coordinates === cellDialog), 1);
                            }
                            setLevel(newLevel);
                        }}
                    />
                </div> : null}
            </DialogContent>
        </Dialog>
    </div>;
}

export default Editor;
