import { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import copy from 'copy-to-clipboard';
import { arrayMoveImmutable } from 'array-move';
import {
    Button, Grid,
} from '@mui/material';
import ManIcon from '@mui/icons-material/Man';
import {
    moveCoordinates, parseCoordinates, randomArray, clone, getRandomInt,
} from './Utils';
import {
    CharacterType, CoordinatesType, LevelType, LineType, StepDirection, ValueDirectionType, ValueNumberType,
} from './types';
import Cells from './Cells';
import AddPanel from './AddPanel';
import renderLine from './renderLine';

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
                const direction = randomArray((line.destination as StepDirection).directions);
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
                    character.item = { type: 'box', value: getRandomInt(0, 99) };
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

    let intend = 0;

    const renderLines = useMemo(() => code.map((line, key) => {
        const lineResult = renderLine(line, key, code, setCode, intend);
        intend = lineResult.intend;
        return lineResult.result;
    }), [code]);

    return <Grid container>
        <Grid item md={6}>
            <h2>{level.task}</h2>
            <h4>{run && props.level.win(level.cells, characters) ? 'Win' : null}</h4>
            <Cells
                cells={level.cells}
                characters={characters}
                width={level.width}
                height={level.height}
                run={run}
                speed={speed}
            />
        </Grid>
        <Grid item md={1}>
            <AddPanel code={code} setCode={setCode} />
        </Grid>
        <Grid item md={5}>
            <div style={{ paddingLeft: 20 }}>
                <SortableContainer onSortEnd={({ oldIndex, newIndex }, e) => {
                    if (e.ctrlKey) {
                        const newCode = clone(code);
                        newCode.splice(newIndex, 0, code[oldIndex]);
                        setCode(newCode);
                    } else {
                        const newCode = arrayMoveImmutable(code, oldIndex, newIndex);
                        const blocks = [];
                        newCode.forEach(line => {
                            if (line.type === 'if') {
                                blocks.push(line.id);
                            }
                            if (line.type === 'endif' && blocks[blocks.length - 1] === line.ifId) {
                                blocks.splice(blocks.indexOf(line.ifId), 1);
                            }
                        });
                        if (blocks.length) {
                            return;
                        }
                        setCode(newCode);
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
                                        cell.item.value = getRandomInt(0, 99);
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
