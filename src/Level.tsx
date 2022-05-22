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
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { v4 as uuidv4 } from 'uuid';
import {
    directionIcon,
    moveCoordinates, parseCoordinates, randomArray, clone,
} from './Utils';
import {
    CharacterType, CoordinatesType, DirectionType, DirectionTypeWithHere, IfOperationType, LevelType, LineGiveType, LineGotoType, LineIfType, LineStepType, LineType, ValueDirectionType, ValueNumberType,
} from './types';

const CELL_WIDTH = 80;

const SortableItem = sortableElement(({ children }) => <div>{children}</div>);

const SortableContainer = sortableContainer(({ children }) => <div>{children}</div>);

function Level(props: {level: LevelType}) {
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
        const newCoordinatesArray:CoordinatesType[] = [];
        newCharacters.forEach((character, characterIndex) => {
            newCoordinatesArray[characterIndex] = character.coordinates;
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
                if (newCell && ['empty', 'hole'].includes(newCell.type)) {
                    newCoordinatesArray[characterIndex] = newCoordinates.join('x');
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
            if (line.type === 'take') {
                const itemCoordinates = moveCoordinates(coordinates, line.direction).join('x');
                if (!character.item && newLevel.cells[itemCoordinates]?.type === 'printer') {
                    character.item = { type: 'box', value: Math.floor(Math.random() * 99) };
                    newLevel.cells[itemCoordinates].printed++;
                }
            }
            if (line.type === 'give') {
                const itemCoordinates = moveCoordinates(coordinates, line.direction).join('x');
                if (character.item && newLevel.cells[itemCoordinates]?.type === 'shredder') {
                    delete character.item;
                    newLevel.cells[itemCoordinates].shredded++;
                }
            }
            if (line.type === 'if') {
                let result = false;
                const condition = line.conditions[0];
                const value1coordinates = moveCoordinates(coordinates, (condition.value1 as ValueDirectionType).value).join('x');
                if (newLevel.cells[value1coordinates]) {
                    const value1 = characters.find(foundCharacter => (condition.value1 as ValueDirectionType).value !== 'here' && foundCharacter.coordinates === value1coordinates)?.item?.value ||
                  newLevel.cells[value1coordinates]?.item?.value || 0;
                    let value2 = 0;
                    if (condition.value2.type === 'number') {
                        value2 = (condition.value2 as ValueNumberType).value;
                    }
                    if (condition.value2.type === 'myitem') {
                        value2 = character.item?.value || 0;
                    }
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
        newCharacters.forEach((character, characterIndex) => {
            const line = code[character.step];
            if (!line) {
                return;
            }
            if (!characters.find(foundCharacter => foundCharacter.coordinates === newCoordinatesArray[characterIndex]) ||
            characters.find((foundCharacter, foundCharacterIndex) =>
                foundCharacter.coordinates === newCoordinatesArray[characterIndex] && character.coordinates === newCoordinatesArray[foundCharacterIndex])) {
                character.coordinates = newCoordinatesArray[characterIndex];
                if (level.cells[character.coordinates].type === 'hole') {
                    character.terminated = true;
                }
            } else if (code[character.step].type === 'step') {
                character.step--;
            }
        });
        const gived:string[] = [];
        newCharacters.forEach((character, characterIndex) => {
            const line = code[character.step];
            if (!line) {
                return;
            }
            if (gived.includes(character.name)) {
                return;
            }
            if (line.type === 'give' && character.item?.type === 'box') {
                const giveCell = moveCoordinates(parseCoordinates(character.coordinates), line.direction);
                const giveCharacter = newCharacters.find(foundCharacter => foundCharacter.coordinates === giveCell.join('x'));
                const giveCharacterStep = giveCharacter ? code[giveCharacter.step] : null;
                if (giveCharacter) {
                    if (!giveCharacter.item) {
                        giveCharacter.item = character.item;
                        delete character.item;
                        gived.push(giveCharacter.name);
                    } else if (giveCharacter.item && giveCharacterStep?.type === 'give' &&
                    moveCoordinates(parseCoordinates(giveCharacter.coordinates), giveCharacterStep.direction).join('x') === character.coordinates
                    ) {
                        const tempItem = character.item;
                        character.item = giveCharacter.item;
                        giveCharacter.item = tempItem;
                        gived.push(giveCharacter.name);
                    } else {
                        character.step--;
                    }
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
        if (cell.type === 'printer') {
            content = 'printer';
        }
        if (cell.type === 'shredder') {
            content = 'shredder';
        }
        if (cell.item?.type === 'box') {
            content = <>
                <AddBoxIcon fontSize="small" />
                {' '}
                {cell.item.isRandom && !run ? '?' : cell.item.value}
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

    let intend = 0;
    const renderLine = (line: LineType, lineNumber: number) => {
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
                        newCode[lineNumber].directions = e.target.value as DirectionType[];
                        setCode(newCode);
                    }}
                >
                    {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
                        <MenuItem key={direction} value={direction}>
                            {directionIcon(direction)}
                            {direction}
                        </MenuItem>)}
                </Select>
            </span>;
        }
        if (line.type === 'give') {
            result = <span>
Give:
                {' '}
                <ManIcon fontSize="small" />
                <EastIcon fontSize="small" />
                <CheckBoxOutlineBlankIcon fontSize="small" />
                {' '}
                <Select
                    value={line.direction}
                    variant="standard"
                    onChange={e => {
                        const newCode = clone(code) as LineGiveType[];
                        newCode[lineNumber].direction = e.target.value as DirectionType;
                        setCode(newCode);
                    }}
                >
                    {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
                        <MenuItem key={direction} value={direction}>
                            {directionIcon(direction)}
                            {direction}
                        </MenuItem>)}
                </Select>
            </span>;
        }
        if (line.type === 'take') {
            result = <span>
                Take
                {' '}
                <ManIcon fontSize="small" />
                <WestIcon fontSize="small" />
                <CheckBoxOutlineBlankIcon fontSize="small" />
                {' '}
                <Select
                    value={line.direction}
                    variant="standard"
                    onChange={e => {
                        const newCode = clone(code) as LineGiveType[];
                        newCode[lineNumber].direction = e.target.value as DirectionType;
                        setCode(newCode);
                    }}
                >
                    {['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((direction:DirectionType) =>
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
                        newCode[lineNumber].step = e.target.value as number;
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
                    value={(line.conditions[0].value1 as ValueDirectionType).value}
                    variant="standard"
                    onChange={e => {
                        const newCode = clone(code) as LineIfType[];
                        (newCode[lineNumber].conditions[0].value1 as ValueDirectionType).value = e.target.value as DirectionTypeWithHere;
                        setCode(newCode);
                    }}
                >
                    {['left', 'right', 'top', 'bottom', 'here', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((option:DirectionType) =>
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
                        newCode[lineNumber].conditions[0].operation = e.target.value as IfOperationType;
                        setCode(newCode);
                    }}
                >
                    {['==', '>', '<', '>=', '<='].map(option =>
                        <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </Select>
                <Select
                    value={(line as LineIfType).conditions[0].value2.type}
                    onChange={e => {
                        const newCode = clone(code) as LineIfType[];
                        if (e.target.value === 'number') {
                            newCode[lineNumber].conditions[0].value2 = { type: 'number', value: 0 };
                        }
                        if (e.target.value === 'myitem') {
                            newCode[lineNumber].conditions[0].value2 = { type: 'myitem' };
                        }
                        setCode(newCode);
                    }}
                    variant="standard"
                >
                    {['number', 'myitem'].map(option =>
                        <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </Select>
                {line.conditions[0].value2.type === 'number' ?
                    <TextField
                        type="number"
                        value={line.conditions[0].value2.value}
                        variant="standard"
                        onChange={e => {
                            const newCode = clone(code) as LineIfType[];
                            (newCode[lineNumber].conditions[0].value2 as ValueNumberType).value = parseInt(e.target.value) || 0;
                            setCode(newCode);
                        }}
                    /> : null}

            </span>;
        }
        if (line.type === 'endif') {
            result = 'Endif';
        }
        if (line.type === 'pickup') {
            result = 'Pickup';
        }
        if (!result) {
            result = JSON.stringify(line);
        }

        if (line.type === 'endif') {
            intend -= 20;
        }
        result = <span key={lineNumber}>
            {lineNumber}
            {': '}
            <span style={{ paddingLeft: intend }}>{result}</span>
            <IconButton
                size="small"
                onMouseDown={() => {
                    const newCode = [...code];
                    const deleteLine = newCode[lineNumber];
                    newCode.splice(lineNumber, 1);
                    if (deleteLine.type === 'if') {
                        newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'endif' && foundLine.ifId === deleteLine.id), 1);
                    }
                    if (deleteLine.type === 'endif') {
                        newCode.splice(newCode.findIndex(foundLine => foundLine.type === 'if' && foundLine.id === deleteLine.ifId), 1);
                    }
                    setCode(newCode);
                }}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        </span>;
        if (line.type === 'if') {
            intend += 20;
        }

        return result;
    };

    const renderLines = useMemo(() => code.map((line, key) => renderLine(line, key)), [code]);

    return <Grid container>
        <Grid item md={6}>
            <h2>{level.task}</h2>
            <h4>{run && props.level.win(level.cells, characters) ? 'Win' : null}</h4>
            <div style={{ position: 'relative', width: level.width * CELL_WIDTH + CELL_WIDTH / 2, height: level.height * CELL_WIDTH + CELL_WIDTH / 2 }}>
                {cellDivs}
                {characterDivs}
            </div>
        </Grid>
        <Grid item md={1}>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'step', directions: ['left'], id: uuidv4() });
                    setCode(newCode);
                }}
                >
Add step
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'give', direction: 'left', id: uuidv4() });
                    setCode(newCode);
                }}
                >
Add give
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'take', direction: 'left', id: uuidv4() });
                    setCode(newCode);
                }}
                >
Add take
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'goto', step: 0, id: uuidv4() });
                    setCode(newCode);
                }}
                >
Add goto
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'pickup', id: uuidv4() });
                    setCode(newCode);
                }}
                >
Add pickup
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code];
                    newCode.push({ type: 'drop', id: uuidv4() });
                    setCode(newCode);
                }}
                >
Add drop
                </Button>
            </div>
            <div>
                <Button onClick={() => {
                    const newCode = [...code] as LineType[];
                    const id = uuidv4();
                    newCode.push({
                        type: 'if',
                        conditions: [{
                            value1: { type: 'direction', value: 'here' },
                            operation: '==',
                            value2: { type: 'number', value: 0 },
                        }],
                        id
                    }, { type: 'endif', ifId: uuidv4() });
                    setCode(newCode);
                }}
                >
Add if
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
                    {code.map((line, key) => {
                        const result = <SortableItem index={key} key={key}>
                            {characters.filter(character => character.step === key).map(character => <span key={character.name}>
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
                    <input type="number" value={1000 / speed} onChange={e => setSpeed(1000 / (parseInt(e.target.value) || 1))} />
                </div>
                <div>
                    <Button
                        onClick={() => {
                            const newLevel = clone(props.level as LevelType);
                            if (!run) {
                                Object.values(newLevel.cells).forEach(cell => {
                                    if (cell.item?.isRandom) {
                                        cell.item.value = Math.floor(Math.random() * 99);
                                    }
                                });
                            }
                            setLevel(newLevel);
                            setCharacters(props.level.characters);
                            setRun(!run);
                        }}
                        disabled={intend !== 0}
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
