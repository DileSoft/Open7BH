import { useEffect, useState } from 'react';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { parseCells, parseCoordinates, randomArray } from './Utils';

const SortableItem = sortableElement(({ children }) => <li>{children}</li>);

const SortableContainer = sortableContainer(({ children }) => <ul>{children}</ul>);

const Level = props => {
    const [level, setLevel] = useState({
        width: 10,
        height: 10,
        cells: parseCells(
            `empty empty empty box|1 empty
empty wall wall box|2 empty
empty wall wall box|3 empty
empty empty empty box|4 empty
empty empty empty box|5 empty`,
        ),
    });

    const [characters, setCharacters] = useState([
        { cooordinates: '0x0', name: 'first', step: -1 },
        { cooordinates: '0x1', name: 'second', step: -1 },
    ]);

    const [code, setCode] = useState([
        { type: 'step', directions: ['left', 'right', 'top', 'bottom'] },
        { type: 'pickup' },
        { type: 'step', directions: ['left', 'right', 'top', 'bottom'] },
        { type: 'drop' },
        { type: 'goto', step: 0 },
        { type: 'step', directions: ['bottom'] },
        { type: 'step', directions: ['right'] },
        { type: 'step', directions: ['right'] },
        { type: 'step', directions: ['right'] },
        { type: 'step', directions: ['left'] },
        { type: 'step', directions: ['top'] },
        { type: 'step', directions: ['right'] },
        { type: 'goto', step: 0 },
    ]);

    const [step, setStep] = useState(-1);
    const [speed, setSpeed] = useState(1000);

    useEffect(() => {
        const interval = setInterval(() => setStep(prevStep => prevStep + 1), speed);
        return () => clearInterval(interval);
    }, [speed]);

    useEffect(() => {
        if (step === -1) {
            return;
        }
        const newCharacters = JSON.parse(JSON.stringify(characters));
        const newLevel = JSON.parse(JSON.stringify(level));
        newCharacters.forEach(character => {
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
                const newCoordinates = [...coordinates];
                const direction = randomArray(line.directions);
                if (direction === 'left') {
                    newCoordinates[0] -= 1;
                }
                if (direction === 'right') {
                    newCoordinates[0] += 1;
                }
                if (direction === 'top') {
                    newCoordinates[1] -= 1;
                }
                if (direction === 'bottom') {
                    newCoordinates[1] += 1;
                }
                const newCell = level.cells[newCoordinates.join('x')];
                if (newCell && ['empty', 'box'].includes(newCell.type) && !characters.find(foundCharacter => foundCharacter.cooordinates === newCoordinates.join('x'))) {
                    character.cooordinates = newCoordinates.join('x');
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
        if (cell.type === 'wall') {
            content = 'wall';
        }
        if (cell.type === 'box') {
            content = `box (${cell.value})`;
        }

        const character = characters.find(foundCharacter => foundCharacter.cooordinates === cellCoordinate);
        return <div
            key={cellCoordinate}
            style={{
                position: 'absolute',
                left: coordinates[0] * 40,
                top: coordinates[1] * 40,
                width: 40,
                height: 40,
                borderStyle: 'solid',
                borderColor: 'black',
                borderWidth: 1,
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
                {character.name}
                {character.item === 'box' ? `(${character.itemValue})` : null}
            </div> : null}
        </div>;
    });

    const renderLine = (line, lineNumber) => {
        if (line.type === 'step') {
            return `Step: ${line.directions.join(', ')}`;
        }
        if (line.type === 'goto') {
            return <span>
Goto:
                {' '}
                <select
                    value={line.step}
                    onChange={e => {
                        const newCode = JSON.parse(JSON.stringify(code));
                        newCode[lineNumber].step = e.target.value;
                        setCode(newCode);
                    }}
                >
                    {Object.keys(code).map(optionLineNumber => <option value={optionLineNumber}>{optionLineNumber}</option>)}
                </select>
            </span>;
        }
        return JSON.stringify(line);
    };

    return <div>
        {cellDivs}
        <div style={{
            position: 'absolute',
            right: 0,
            width: 400,
        }}
        >
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
                    <div key={key}>
                        <SortableItem index={key}>
                            {characters.filter(character => character.step === key).map(character => character.name).join(', ')}
                            {renderLine(line, key)}
                        </SortableItem>
                    </div>)}
            </SortableContainer>
            Speed:
            {' '}
            <input type="number" value={1000 / speed} onChange={e => setSpeed(1000 / (parseInt(e.target.value) || 1))} />
        </div>
    </div>;
};

export default Level;
