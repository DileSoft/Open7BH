import Game, { GameSerialized, LevelTranslations } from './Classes/Game';
import Level, { CharacterSerializedType } from './Classes/Level';
import {
    DEFAULT_WIN_CONDITIONS,
    NeighborDirection,
    WinCondition,
    WinConditionsList,
    WinOperator,
    WinValueSource,
} from './Classes/WinConditions';
import Cell from './Classes/Cell';
import Wall from './Classes/Wall';
import Hole from './Classes/Hole';
import Printer from './Classes/Printer';
import Shredder from './Classes/Shredder';
import Empty from './Classes/Empty';

/**
 * Compact, human-readable JSON format used to store levels that can be dropped
 * into the game source (src/Classes/Levels/levelN.json) and imported via
 * levelsList.tsx. No functions anywhere — win conditions are declarative.
 */
export interface LevelJsonFormat {
    name: string;
    translations?: LevelTranslations;
    level: {
        task: string;
        width: number;
        height: number;
        /** Same syntax as Level.parseCells() rows: "box|1 wall hole …" */
        cellsMap: string;
        characters: CharacterSerializedType[];
        winConditions?: WinConditionsList;
    };
    /** Starting code, same shape as GameSerialized.code. */
    code?: GameSerialized['code'];
}

const cellToToken = (cell: Cell | undefined): string => {
    if (!cell) return 'empty';
    if (cell instanceof Wall) return 'wall';
    if (cell instanceof Hole) return 'hole';
    if (cell instanceof Shredder) return 'shredder';
    if (cell instanceof Printer) {
        if (cell.min === 0 && cell.max === 99 && cell.fixedValue === undefined) return 'printer';
        const fixed = cell.fixedValue !== undefined ? `|${cell.fixedValue}` : '';
        return `printer|${cell.min}|${cell.max}${fixed}`;
    }
    if (cell instanceof Empty && cell.item) {
        const random = cell.item.isRandom ? 'random' : String(cell.item.value);
        const tag = cell.item.tag ? `|${cell.item.tag}` : '';
        return `box|${random}${tag}`;
    }
    return 'empty';
};

const mapToCellsMap = (level: Level): string => {
    const rows: string[] = [];
    for (let y = 0; y < level.height; y++) {
        const row: string[] = [];
        for (let x = 0; x < level.width; x++) {
            row.push(cellToToken(level.getCell(x, y)));
        }
        rows.push(row.join(' '));
    }
    return rows.join('\n');
};

export function serializeLevelToJson(game: Game): LevelJsonFormat {
    const level = game.level;
    const characters: CharacterSerializedType[] = level.getCharacters().map(character => ({
        name: character.name,
        color: character.color,
        coordinates: [character.cell.x, character.cell.y] as [number, number],
    }));
    if (!game.translations) {
        game.translations = {
            task: { en: level.task, ru: level.task },
            characterNames: Object.fromEntries(characters.map(c => [c.name, { en: c.name, ru: c.name }])),
        };
    }
    return {
        name: game.name,
        translations: game.translations,
        level: {
            task: level.task,
            width: level.width,
            height: level.height,
            cellsMap: mapToCellsMap(level),
            characters,
            winConditions: level.winConditions,
        },
        code: game.serialize(false).code,
    };
}

/**
 * A blank level (5x5, empty) to start creating a new level in the editor.
 * The name is empty on purpose — the user names it when saving.
 */
export function createEmptyLevel(): GameSerialized {
    return {
        name: '',
        translations: { task: { en: '', ru: '' }, characterNames: {} },
        level: {
            task: '',
            width: 5,
            height: 5,
            cells: Level.parseCells(
                'empty empty empty empty empty\n'
                + 'empty empty empty empty empty\n'
                + 'empty empty empty empty empty\n'
                + 'empty empty empty empty empty\n'
                + 'empty empty empty empty empty',
                [],
            ),
            winConditions: { mode: 'all', conditions: [] },
        },
        code: [],
    };
}

export function parseLevelJson(json: LevelJsonFormat): GameSerialized {
    const winConditions = normalizeWinConditions((json.level as { winConditions?: unknown }).winConditions);
    const cells = Level.parseCells(
        json.level.cellsMap,
        (json.level.characters ?? []).map(character => ({
            name: String(character.name ?? ''),
            color: String(character.color ?? 'green'),
            coordinates: toPoint(character.coordinates),
        })),
    );
    return {
        name: json.name,
        translations: json.translations,
        level: {
            task: json.level.task,
            width: json.level.width,
            height: json.level.height,
            cells,
            winConditions,
        },
        code: json.code ?? [],
    };
}

// ---- Normalization helpers (JSON files can carry loose/missing fields) ----

const ALL_OPERATORS = ['eq', 'ne', 'gt', 'ge', 'lt', 'le'];
const ALL_DIRECTIONS = ['up', 'down', 'left', 'right'];

const numberOr = (value: unknown, fallback = 0): number => (
    typeof value === 'number' ? value
        : typeof value === 'string' ? (parseInt(value, 10) || fallback)
            : fallback
);

const asOperator = (value: unknown): WinOperator => (
    ALL_OPERATORS.includes(String(value)) ? String(value) as WinOperator : 'ge'
);

const asDirection = (value: unknown): NeighborDirection => (
    ALL_DIRECTIONS.includes(String(value)) ? String(value) as NeighborDirection : 'left'
);

const toPoint = (value: unknown): [number, number] => {
    if (Array.isArray(value) && value.length >= 2
        && typeof value[0] === 'number' && typeof value[1] === 'number') {
        return [value[0], value[1]];
    }
    return [0, 0];
};

const toPoints = (value: unknown): [number, number][] => {
    if (!Array.isArray(value)) return [];
    return value.map(pair => toPoint(pair));
};

const normalizeCondition = (raw: unknown): WinCondition | null => {
    if (!raw || typeof raw !== 'object') return null;
    const condition = raw as Record<string, unknown>;
    switch (condition.kind) {
        case 'noBoxes':
            return { kind: 'noBoxes' };
        case 'boxCount':
            return {
                kind: 'boxCount',
                operator: asOperator(condition.operator),
                value: numberOr(condition.value),
            };
        case 'cellsHaveItems':
            return { kind: 'cellsHaveItems', coordinates: toPoints(condition.coordinates) };
        case 'cellsEmpty':
            return { kind: 'cellsEmpty', coordinates: toPoints(condition.coordinates) };
        case 'tagPresent':
            return { kind: 'tagPresent', tag: String(condition.tag ?? '') };
        case 'tagAbsent':
            return { kind: 'tagAbsent', tag: String(condition.tag ?? '') };
        case 'characterAt':
            return { kind: 'characterAt', coordinates: toPoint(condition.coordinates) };
        case 'shredded':
            return {
                kind: 'shredded',
                coordinates: toPoint(condition.coordinates),
                operator: asOperator(condition.operator),
                value: numberOr(condition.value),
            };
        case 'sortedByItemValue':
            return {
                kind: 'sortedByItemValue',
                coordinates: toPoints(condition.coordinates),
                ascending: condition.ascending !== false,
                source: condition.source as WinValueSource | undefined,
            };
        case 'neighborCompare':
            return {
                kind: 'neighborCompare',
                coordinates: toPoint(condition.coordinates),
                direction: asDirection(condition.direction),
                operator: asOperator(condition.operator),
                source: condition.source as WinValueSource | undefined,
            };
        case 'code':
            return { kind: 'code', code: String(condition.code ?? 'level => true') };
        default:
            return null;
    }
};

const normalizeWinConditions = (raw: unknown): WinConditionsList => {
    if (!raw || typeof raw !== 'object') return { ...DEFAULT_WIN_CONDITIONS };
    const list = raw as { mode?: unknown, conditions?: unknown };
    const conditions = Array.isArray(list.conditions)
        ? list.conditions.map(normalizeCondition).filter((c): c is WinCondition => c !== null)
        : [];
    return {
        mode: list.mode === 'any' ? 'any' : 'all',
        conditions,
    };
};

const escapeTemplate = (str: string): string => str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

const indentBlock = (block: string, indent: string): string => block
    .split('\n')
    .map(line => (line ? `${indent}${line}` : line))
    .join('\n');

/**
 * Generates a ready-to-paste TypeScript module (levelN.tsx style) equivalent to
 * the level currently open in the editor. Useful when you prefer a code level
 * over a .json file.
 */
export function gameToTsModule(game: Game): string {
    const json = serializeLevelToJson(game);
    const charactersTs = json.level.characters
        .map(c => `        { coordinates: [${c.coordinates[0]}, ${c.coordinates[1]}], name: ${JSON.stringify(c.name)}, color: ${JSON.stringify(c.color)} },`)
        .join('\n');
    return `import { GameSerialized } from '../Game';
import Level from '../Level';

const level: GameSerialized = {
    name: ${JSON.stringify(json.name)},
    translations: ${indentBlock(JSON.stringify(json.translations, null, 4), '    ')},
    level: {
        task: ${JSON.stringify(json.level.task)},
        width: ${json.level.width},
        height: ${json.level.height},
        cells: Level.parseCells(
            \`${escapeTemplate(json.level.cellsMap)}\`,
            [
${charactersTs}
            ],
        ),
        winConditions: ${indentBlock(JSON.stringify(json.level.winConditions, null, 4), '        ')},
    },
    code: ${indentBlock(JSON.stringify(json.code ?? [], null, 4), '    ')},
};

export default level;
`;
}