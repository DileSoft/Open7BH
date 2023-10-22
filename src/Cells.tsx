import ManIcon from '@mui/icons-material/Man';
import AddBoxIcon from '@mui/icons-material/AddBox';

import { CellsType, CharacterType, CoordinatesType } from './types';
import { parseCoordinates } from './Utils';
import { GameSerialized, GameState } from './Classes/Game';
import Empty from './Classes/Empty';
import Hole from './Classes/Hole';
import Printer from './Classes/Printer';

const CELL_WIDTH = 80;

function Cells(props: {game: GameSerialized,
     onClick?: (coordinates: CoordinatesType) => void
    }) {
    const cells = props.game.object.level.cells;
    const cellDivs = Object.keys(cells).map(cellCoordinate => {
        const coordinates = parseCoordinates(cellCoordinate);
        const cell = cells[cellCoordinate];
        let content;
        if (cell instanceof Empty) {
            content = null;
            if (cell.getItem()) {
                content = <>
                    <AddBoxIcon fontSize="small" />
                    {' '}
                    {cell.item.isRandom && props.game.state !== GameState.Run ? '?' : cell.item.value}
                </>;
            }
        }
        if (cell instanceof Hole) {
            content = <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></div>;
        }
        // if (cell.type === 'wall') {
        //     content = 'wall';
        // }
        if (cell instanceof Printer) {
            content = 'printer';
        }
        // if (cell.type === 'shredder') {
        //     content = 'shredder';
        // }

        return <div
            onClick={() => props.onClick(cellCoordinate)}
            key={cellCoordinate}
            style={{
                position: 'absolute',
                left: coordinates[0] * CELL_WIDTH,
                top: coordinates[1] * CELL_WIDTH,
                width: CELL_WIDTH,
                height: CELL_WIDTH,
                // borderStyle: cell.type === 'nothing' ? 'dotted' : 'solid',
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

    const characterDivs = props.game.object.level.getCharacters()
        .sort((c1, c2) => (c1.name > c2.name ? 1 : -1))
        .map(character => {
            const coordinates = [character.cell.x, character.cell.y];
            return <div
                key={character.name}
                style={{
                    position: 'absolute',
                    opacity: character.isDead ? 0 : 1,
                    transform: `translate(${coordinates[0] * CELL_WIDTH}px, ${coordinates[1] * CELL_WIDTH + 10}px)`,
                    transition: `all ${props.game.speed}ms ease-in`,
                }}
            >
                <ManIcon fontSize="small" style={{ color: character.color }} />
                {character.item ? <>
(
                    <AddBoxIcon fontSize="small" />
                    {' '}
                    {character.item.value}
)
                </> : null}
            </div>;
        });

    return <div style={{ position: 'relative', width: props.game.level.width * CELL_WIDTH + CELL_WIDTH / 2, height: props.game.level.height * CELL_WIDTH + CELL_WIDTH / 2 }}>
        {cellDivs}
        {characterDivs}
    </div>;
}

export default Cells;
