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
    CharacterType, CoordinatesType, LevelType, LineType, StepDirection, ValueDirectionType, ValueNumberType, ValuePrinterType,
} from './types';
import Cells from './Cells';
import AddPanel from './AddPanel';
import renderLine from './renderLine';

const SortableItem = sortableElement(({ children }) => <div>{children}</div>);

const SortableContainer = sortableContainer(({ children }) => <div>{children}</div>);

function Level(props: {level: LevelType, levelNumber: number}) {
    const [level, setLevel] = useState<LevelType>(props.level);
    const [characters, setCharacters] = useState<CharacterType[]>(props.level.characters);
    const [code, setRawCode] = useState<LineType[]>(props.level.code);
    const setCode = (newCode: LineType[]) => {
        window.localStorage.setItem(`level${props.levelNumber}`, JSON.stringify(newCode));
        setRawCode(newCode);
    };

    const [run, setRun] = useState(false);

    const [step, setStep] = useState<number>(-1);
    const [speed, setSpeed] = useState(1000);

    useEffect(() => {
        setLevel(props.level);
        setCharacters(props.level.characters);
        if (window.localStorage.getItem(`level${props.levelNumber}`)) {
            setRawCode(JSON.parse(window.localStorage.getItem(`level${props.levelNumber}`)));
        } else {
            setCode(props.level.code);
        }
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
            } else if (line.type === 'goto') {
                character.step = line.step - 1;
            } else if (line.type === 'pickup') {
                if (!character.item && newLevel.cells[character.coordinates].item?.type === 'box') {
                    character.item = newLevel.cells[character.coordinates].item;
                    delete newLevel.cells[character.coordinates].item;
                }
            } else if (line.type === 'drop') {
                if (character.item?.type === 'box' && !newLevel.cells[character.coordinates].item) {
                    newLevel.cells[character.coordinates].item = character.item;
                    delete character.item;
                }
            }
            if (line.type === 'take') {
                const itemCoordinates = moveCoordinates(coordinates, (line.direction as ValueDirectionType).value).join('x');
                if (!character.item && newLevel.cells[itemCoordinates]?.type === 'printer') {
                    character.item = { type: 'box', value: getRandomInt(0, 99) };
                    newLevel.cells[itemCoordinates].printed++;
                }
            } else if (line.type === 'give') {
                const itemCoordinates = moveCoordinates(coordinates, (line.direction as ValueDirectionType).value).join('x');
                if (character.item && newLevel.cells[itemCoordinates]?.type === 'shredder') {
                    delete character.item;
                    newLevel.cells[itemCoordinates].shredded++;
                }
            } else if (line.type === 'hear') {
                character.wait = line.text;
                character.step--;
            } else if (line.type === 'say') {
                if (line.target.type === 'direction') {
                    const targetCoordinates = moveCoordinates(coordinates, line.target.value).join('x');
                    const targetCharacter = newCharacters.find(foundCharacter => foundCharacter.coordinates === targetCoordinates);
                    if (targetCharacter && targetCharacter.wait === line.text) {
                        targetCharacter.wait = '';
                        targetCharacter.step++;
                    }
                }
                if (line.target.type === 'all') {
                    newCharacters.forEach(foundCharacter => {
                        if (foundCharacter.wait === line.text) {
                            foundCharacter.wait = '';
                            foundCharacter.step++;
                        }
                    });
                }
            } else if (line.type === 'foreach') {
            } else if (line.type === 'endforeach') {
            } else if (line.type === 'calc') {
            } else if (line.type === 'variable') {
            } else if (line.type === 'near') {
            } else if (line.type === 'if') {
                let result = false;
                line.conditions.forEach(condition => {
                    let localResult = false;
                    let number1:number;
                    let number2:number;
                    let type1:string;
                    let type2:string;
                    let conditionType: 'number' | 'type';

                    if (condition.value1.type === 'direction') {
                        const value1coordinates = moveCoordinates(coordinates, (condition.value1 as ValueDirectionType).value).join('x');
                        number1 = characters.find(foundCharacter => (condition.value1 as ValueDirectionType).value !== 'here' && foundCharacter.coordinates === value1coordinates)?.item?.value;
                        if (number1 === undefined) {
                            number1 = newLevel.cells[value1coordinates]?.item?.value;
                        }
                        type1 = newLevel.cells[value1coordinates]?.type;
                    } else if (condition.value1.type === 'slot') {
                    } else if (condition.value1.type === 'myitem') {
                        if (character.item) {
                            number1 = character.item.value;
                            type1 = character.item.type;
                        }
                    }
                    if (condition.value2.type === 'direction') {
                        const value2coordinates = moveCoordinates(coordinates, (condition.value2 as ValueDirectionType).value).join('x');
                        number2 = characters.find(foundCharacter => (condition.value2 as ValueDirectionType).value !== 'here' && foundCharacter.coordinates === value2coordinates)?.item?.value;
                        if (number2 === undefined) {
                            number2 = newLevel.cells[value2coordinates]?.item?.value;
                        }
                        type2 = newLevel.cells[value2coordinates]?.type;
                        localResult = number1 === number2;
                    } else if (condition.value2.type === 'slot') {
                    } else if (condition.value2.type === 'myitem') {
                        if (character.item) {
                            number2 = character.item.value;
                            type2 = character.item.type;
                        }
                        conditionType = 'number';
                    } else if (condition.value2.type === 'number') {
                        number2 = condition.value2.value;
                        conditionType = 'number';
                    } else {
                        type2 = condition.value2.type;
                        localResult = type1 === type2;
                        conditionType = 'type';
                    }

                    if (conditionType === 'number') {
                        if (condition.operation === '==') {
                            localResult = number1 === number2;
                        }
                        if (condition.operation === '!=') {
                            localResult = number1 !== number2;
                        }
                        if (condition.operation === '>') {
                            localResult = number1 > number2;
                        }
                        if (condition.operation === '<') {
                            localResult = number1 < number2;
                        }
                        if (condition.operation === '<=') {
                            localResult = number1 <= number2;
                        }
                        if (condition.operation === '>=') {
                            localResult = number1 >= number2;
                        }
                    }
                    if (conditionType === 'type') {
                        if (condition.operation === '==') {
                            localResult = type1 === type2;
                        }
                        if (condition.operation === '!=') {
                            localResult = type1 !== type2;
                        }
                    }
                    if (condition.logic === 'OR') {
                        result = result || localResult;
                    } else {
                        result = result && localResult;
                    }
                });
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
                const giveCell = moveCoordinates(parseCoordinates(character.coordinates), (line.direction as ValueDirectionType).value);
                const giveCharacter = newCharacters.find(foundCharacter => foundCharacter.coordinates === giveCell.join('x'));
                const giveCharacterStep = giveCharacter ? code[giveCharacter.step] : null;
                if (giveCharacter) {
                    if (!giveCharacter.item) {
                        giveCharacter.item = character.item;
                        delete character.item;
                        gived.push(giveCharacter.name);
                    } else if (giveCharacter.item && giveCharacterStep?.type === 'give' &&
                    moveCoordinates(parseCoordinates(giveCharacter.coordinates), (giveCharacterStep.direction as ValueDirectionType).value).join('x') === character.coordinates
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
                            if (line.type === 'foreach') {
                                blocks.push(line.id);
                            }
                            if (line.type === 'endforeach' && blocks[blocks.length - 1] === line.foreachId) {
                                blocks.splice(blocks.indexOf(line.foreachId), 1);
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
                <div>
                    <Button onClick={() => {
                        window.localStorage.setItem(`level${props.levelNumber}`, JSON.stringify(props.level.code));
                        setCode(props.level.code);
                    }}
                    >
Clear
                    </Button>
                </div>
            </div>
        </Grid>
    </Grid>;
}

export default Level;
