import { useEffect, useMemo, useState } from 'react';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
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
    moveCoordinates, parseCells, parseCoordinates, randomArray,
} from './Utils';

const CELL_WIDTH = 80;

const SortableItem = sortableElement(({ children }) => <div>{children}</div>);

const SortableContainer = sortableContainer(({ children }) => <div>{children}</div>);

const Level = props => {
    const [level, setLevel] = useState(props.level);
    const [characters, setCharacters] = useState(props.level.characters);
    const [code, setCode] = useState(props.level.code);

    const [run, setRun] = useState(false);

    const [step, setStep] = useState(-1);
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
        const newCharacters = JSON.parse(JSON.stringify(characters));
        const newLevel = JSON.parse(JSON.stringify(level));
        const deleted = [];
        newCharacters.forEach((character, characterIndex) => {
            character.step++;
            if (character.step === -1) {
                return;
            }
            const line = code[character.step];
            if (!line) {
                return;
            }
            const coordinates = parseCoordinates(character.cooordinates);
            if (line.type === 'step') {
                const direction = randomArray(line.directions);
                const newCoordinates = moveCoordinates(coordinates, direction);
                const newCell = level.cells[newCoordinates.join('x')];
                if (newCell && ['empty', 'box'].includes(newCell.type) && !characters.find(foundCharacter => foundCharacter.cooordinates === newCoordinates.join('x'))) {
                    character.cooordinates = newCoordinates.join('x');
                }
                if (newCell && newCell.type === 'hole') {
                    deleted.push(characterIndex);
                }
            }
            if (line.type === 'goto') {
                character.step = line.step - 1;
            }
            if (line.type === 'pickup') {
                if (!character.item && newLevel.cells[character.cooordinates].type === 'box') {
                    character.item = 'box';
                    character.itemValue = newLevel.cells[character.cooordinates].value;
                    newLevel.cells[character.cooordinates].type = 'empty';
                    delete newLevel.cells[character.cooordinates].value;
                }
            }
            if (line.type === 'drop') {
                if (character.item && newLevel.cells[character.cooordinates].type === 'empty') {
                    newLevel.cells[character.cooordinates].type = 'box';
                    newLevel.cells[character.cooordinates].value = character.itemValue;
                    delete character.item;
                    delete character.itemValue;
                }
            }
            if (line.type === 'if') {
                const condition = line.conditions[0];
                const value1 = newLevel.cells[moveCoordinates(coordinates, condition.value1).join('x')]?.value || 0;
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
        deleted.reverse().forEach(index => newCharacters.splice(index, 1));
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
        if (cell.type === 'box') {
            content = <>
                <AddBoxIcon fontSize="size" />
                {' '}
                {cell.value}
            </>;
        }

        const character = characters.find(foundCharacter => foundCharacter.cooordinates === cellCoordinate);
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
            {character ? <div
                key={character.name}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 10,
                }}
            >
                <ManIcon fontSize="size" style={{ color: character.color }} />
                {character.item === 'box' ? <>
(
                    <AddBoxIcon fontSize="size" />
                    {' '}
                    {character.itemValue}
)
                </> : null}
            </div> : null}
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
                        const newCode = JSON.parse(JSON.stringify(code));
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
                        const newCode = JSON.parse(JSON.stringify(code));
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
                        const newCode = JSON.parse(JSON.stringify(code));
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
                        const newCode = JSON.parse(JSON.stringify(code));
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
                        const newCode = JSON.parse(JSON.stringify(code));
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

    return <>
        <Grid container>
            <Grid item md={6}>
                <h2>{level.task}</h2>
                <h4>{props.level.win(level.cells, characters) ? 'Win' : null}</h4>
                <div style={{ position: 'relative', width: level.width * CELL_WIDTH + CELL_WIDTH / 2, height: level.height * CELL_WIDTH + CELL_WIDTH / 2 }}>
                    {cellDivs}
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
                            const newCode = JSON.parse(JSON.stringify(code));
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
                                    <ManIcon fontSize="size" style={{ color: character.color }} />
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
                </div>
            </Grid>
        </Grid>
    </>;
};

export default Level;
