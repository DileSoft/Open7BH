import ManIcon from '@mui/icons-material/Man';
import AddBoxIcon from '@mui/icons-material/AddBox';

import { CellsType, CharacterType, CoordinatesType } from './types';
import { parseCoordinates } from './Utils';

const CELL_WIDTH = 80;

function Cells(props: {cells: CellsType, characters: CharacterType[],
     run: boolean, speed: number, width: number, height: number,
     onClick?: (coordinates: CoordinatesType) => void
    }) {
    const cellDivs = Object.keys(props.cells).map(cellCoordinate => {
        const coordinates = parseCoordinates(cellCoordinate);
        const cell = props.cells[cellCoordinate];
        let content;
        if (cell.type === 'empty' || cell.type === 'nothing') {
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
                {cell.item.isRandom && !props.run ? '?' : cell.item.value}
            </>;
        }

        return <div
            onClick={() => props.onClick(cellCoordinate)}
            key={cellCoordinate}
            style={{
                position: 'absolute',
                left: coordinates[0] * CELL_WIDTH,
                top: coordinates[1] * CELL_WIDTH,
                width: CELL_WIDTH,
                height: CELL_WIDTH,
                borderStyle: cell.type === 'nothing' ? 'dotted' : 'solid',
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

    const characterDivs = props.characters.map(character =>            {
        const coordinates = parseCoordinates(character.coordinates);
        return <div
            key={character.name}
            style={{
                position: 'absolute',
                opacity: character.terminated ? 0 : 1,
                transform: `translate(${coordinates[0] * CELL_WIDTH}px, ${coordinates[1] * CELL_WIDTH + 10}px)`,
                transition: `all ${props.speed}ms ease-in`,
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

    return <div style={{ position: 'relative', width: props.width * CELL_WIDTH + CELL_WIDTH / 2, height: props.height * CELL_WIDTH + CELL_WIDTH / 2 }}>
        {cellDivs}
        {characterDivs}
    </div>;
}

export default Cells;
