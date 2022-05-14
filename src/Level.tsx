import { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import copy from 'copy-to-clipboard';
import { arrayMoveImmutable } from 'array-move';
import Select from '@mui/material/Select';
import {
    Button, Grid, IconButton, MenuItem, TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ManIcon from '@mui/icons-material/Man';
import AddBoxIcon from '@mui/icons-material/AddBox';
import {
    directionIcon,
    moveCoordinates, parseCells, parseCoordinates, randomArray, clone,
} from './Utils';
import {
    CharacterType, DirectionType, LevelType, LineGotoType, LineIfType, LineStepType, LineType,
} from './types';

const CELL_WIDTH = 80;

const SortableItem = sortableElement(({ children }) => <div>{children}</div>);

const SortableContainer = sortableContainer(({ children }) => <div>{children}</div>);

function   Level(props) {
    const [level, setLevel] = useState<LevelType>(props.level);
    const [characters, setCharacters] = useState<CharacterType[]>(props.level.characters);
    const [code, setCode] = useState<LineType[]>(props.level.code);

    const [run, setRun] = useState(false);

    const [step, setStep] = useState<number>(-1);
    const [speed, setSpeed] = useState(1000);

    useEffect(() => {
        setLevel(props.level);
        setCharacters(props.level.characters);
        setCode(props.level.code);
    }, [props.level]);

    useEffect(() => {
        if (!run) {
            return;
        }
        const interval = setInterval(() => setStep(prevStep => prevStep + 1), speed);
        return () => clearInterval(interval);
    }, [speed, run]);

    useEffect(() => {
        if (step === -1) {
            return;
        }
        const newCharacters = clone(characters);
        const newLevel = clone(level);
        const deleted = [];
        newCharacters.forEach((character, characterIndex) => {
            if (character.terminated) {
                return;
            }
            character.step++;
            if (character.step === -1) {
                return;
            }
            const line = code[character.step];
            if (!line) {
                return;
            }
            const coordinates = parseCoordinates(character.coordinates);
            if (line.type === 'step') {
                const direction = randomArray(line.directions);
                const newCoordinates = moveCoordinates(coordinates, direction);
                const newCell = level.cells[newCoordinates.join('x')];
                if (newCell && ['empty', 'hole'].includes(newCell.type) && !characters.find(foundCharacter => foundCharacter.coordinates === newCoordinates.join('x'))) {
                    character.coordinates = newCoordinates.join('x');
                }
                if (newCell && newCell.type === 'hole') {
                    character.terminated = true;
                }
            }
            if (line.type === 'goto') {
                character.step = line.step - 1;
            }
            if (line.type === 'pickup') {
                if (!character.item && newLevel.cells[character.coordinates].item?.type === 'box') {
                    character.item = newLevel.cells[character.coordinates].item;
                    delete newLevel.cells[character.coordinates].item;
                }
            }
            if (line.type === 'drop') {
                if (character.item?.type === 'box' && !newLevel.cells[character.coordinates].item) {
                    newLevel.cells[character.coordinates].item = character.item;
                    delete character.item;
                }
            }
            if (line.type === 'if') {
                const condition = line.conditions[0];
                const value1 = newLevel.cells[moveCoordinates(coordinates, condition.value1 as DirectionType).join('x')].item?.value || 0;
                const value2 = condition.value2;
                let result = false;
                if (condition.operation === '==') {
                    result = value1 === value2;
                }
                if (condition.operation === '>') {
                    result = value1 > value2;
                }
                if (condition.operation === '<') {
                    result = value1 < value2;
                }
                if (condition.operation === '<=') {
                    result = value1 <= value2;
                }
                if (condition.operation === '>=') {
                    result = value1 >= value2;
                }
                if (!result) {
                    let k = 0;
                    for (k = character.step; k < code.length; k++) {
                        if (code[k].type === 'endif') {
                            break;
                        }
                    }
                    character.step = k;
                }
            }
        });
        setCharacters(newCharacters);
        setLevel(newLevel);
    }, [step]);

    const cellDivs = Object.keys(level.cells).map(cellCoordinate => {
        const coordinates = parseCoordinates(cellCoordinate);
        const cell = level.cells[cellCoordinate];
        let content;
        if (cell.type === 'empty') {
            content = null;
        }
        if (cell.type === 'hole') {
            content = <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></div>;
        }
        if (cell.type === 'wall') {
            content = 'wall';
        }
        if (cell.item?.type === 'box') {
            content = <>
                <AddBoxIcon fontSize="small" />
                {' '}
                {cell.item.value}
            </>;
        }

        return <div
            key={cellCoordinate}
            style={{
                position: 'absolute',
                left: coordinates[0] * CELL_WIDTH,
                top: coordinates[1] * CELL_WIDTH,
                width: CELL_WIDTH,
                height: CELL_WIDTH,
                borderStyle: 'solid',
                borderColor: 'black',
                borderWidth: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {content}
        </div>;
    });

    const characterDivs = characters.map(character =>            {
        const coordinates = parseCoordinates(character.coordinates);
        return <div
            key={character.name}
            style={{
                position: 'absolute',
                opacity: character.terminated ? 0 : 1,
                transform: `translate(${coordinates[0] * CELL_WIDTH}px, ${coordinates[1] * CELL_WIDTH + 10}px)`,
                transition: `all ${speed}ms ease-in`,
            }}
        >
            <ManIcon fontSize="small" style={{ color: character.color }} />
            {character.item?.type === 'box' ? <>
(
                <AddBoxIcon fontSize="small" />
                {' '}
                {character.item.value}
)
            </> : null}
        </div>;
    });

    const renderLine = (line, lineNumber) => {
        let result = null;
        if (line.type === 'step') {
            result = <span>
Step:
                {' '}
                <Select
                    value={line.directions}
                    variant="standard"
                    multiple
                    onChange={e => {
                        const newCode = clone(code) as LineStepType[];
                        newCode[lineNumber].directions = e.target.value;
                        setCode(newCode);
                    }}
                >
                    {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map(direction =>
                        <MenuItem key={direction} value={direction}>
                            {directionIcon(direction)}
                            {direction}
                        </MenuItem>)}
                </Select>
            </span>;
        }
        if (line.type === 'goto') {
            result = <span>
Goto:
                {' '}
                <Select
                    value={line.step}
                    variant="standard"
                    onChange={e => {
                        const newCode = clone(code) as LineGotoType[];
                        newCode[lineNumber].step = e.target.value;
                        setCode(newCode);
                    }}
                >
                    {Object.keys(code).map(optionLineNumber =>
                        <MenuItem key={optionLineNumber} value={optionLineNumber}>{optionLineNumber}</MenuItem>)}
                </Select>
            </span>;
        }
        if (line.type === 'if') {
            result = <span>
If:
                {' '}
                <Select
                    value={line.conditions[0].value1}
                    variant="standard"
                    onChange={e => {
                        const newCode = clone(code) as LineIfType[];
                        newCode[lineNumber].conditions[0].value1 = e.target.value;
                        setCode(newCode);
                    }}
                >
                    {['left', 'right', 'top', 'bottom', 'here', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map(option =>
                        <MenuItem key={option} value={option}>
                            {directionIcon(option)}
                            {option}
                        </MenuItem>)}
                </Select>
                <Select
                    value={line.conditions[0].operation}
                    variant="standard"
                    onChange={e => {
                        const newCode = clone(code) as LineIfType[];
                        newCode[lineNumber].conditions[0].operation = e.target.value;
                        setCode(newCode);
                    }}
                >
                    {['==', '>', '<', '>=', '<='].map(option =>
                        <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </Select>
                <TextField
                    type="number"
                    value={line.conditions[0].value2}
                    variant="standard"
                    onChange={e => {
                        const newCode = clone(code) as LineIfType[];
                        newCode[lineNumber].conditions[0].value2 = parseInt(e.target.value) || 0;
                        setCode(newCode);
                    }}
                />

            </span>;
        }
        if (!result) {
            result = JSON.stringify(line);
        }
        return <span key={lineNumber}>
            {lineNumber}
            {': '}
            {result}
            <IconButton
                size="small"
                onMouseDown={() => {
                    const newCode = [...code];
                    newCode.splice(lineNumber, 1);
                    setCode(newCode);
                }}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        </span>;
    };

    const renderLines = useMemo(() => code.map((line, key) => renderLine(line, key)), [code]);

    return <Grid container>
        <Grid item md={6}>
            <h2>{level.task}</h2>
            <h4>{props.level.win(level.cells, characters) ? 'Win' : null}</h4>
            <div style={{ position: 'relative', width: level.width * CELL_WIDTH + CELL_WIDTH / 2, height: level.height * CELL_WIDTH + CELL_WIDTH / 2 }}>
                {cellDivs}
                {characterDivs}
            </div>
        </Grid>
        <Grid item md={1}>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'step', directions: ['left'] });
                    setCode(newCode);
                }}
                >
Add step
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'goto', step: 0 });
                    setCode(newCode);
                }}
                >
Add goto
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'pickup' });
                    setCode(newCode);
                }}
                >
Add pickup
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'drop' });
                    setCode(newCode);
                }}
                >
Add drop
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'if', conditions: [{ value1: 'here', operation: '==', value2: 0 }] });
                    setCode(newCode);
                }}
                >
Add if
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'endif' });
                    setCode(newCode);
                }}
                >
Add endif
                </Button>
            </div>
        </Grid>
        <Grid item md={5}>
            <div style={{ paddingLeft: 20 }}>
                <SortableContainer onSortEnd={({ oldIndex, newIndex }, e) => {
                    if (e.ctrlKey) {
                        const newCode = clone(code);
                        newCode.splice(newIndex, 0, code[oldIndex]);
                        setCode(newCode);
                    } else {
                        setCode(arrayMoveImmutable(code, oldIndex, newIndex));
                    }
                }}
                >
                    {code.map((line, key) =>
                        <SortableItem index={key} key={key}>
                            {characters.filter(character => character.step === key).map(character => <span key={character.name}>
                                <ManIcon fontSize="small" style={{ color: character.color }} />
                            </span>)}
                            {renderLines[key]}
                        </SortableItem>)}
                </SortableContainer>
                <div style={{ paddingTop: 20 }}>
Speed:
                    {' '}
                    <input type="number" value={1000 / speed} onChange={e => setSpeed(1000 / (parseInt(e.target.value) || 1))} />
                </div>
                <div>
                    <Button onClick={() => {
                        setLevel(props.level);
                        setCharacters(props.level.characters);
                        setRun(!run);
                    }}
                    >
                        {run ? 'Stop' : 'Run'}
                    </Button>
                </div>
                <div>
                    <Button onClick={() => copy(JSON.stringify(code, null, 2))}>Copy</Button>
                </div>
            </div>
        </Grid>
    </Grid>;
}

export default Level;