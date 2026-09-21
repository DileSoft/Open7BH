import {
    Button,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GameSerialized } from './Classes/Game';
import {
    NeighborDirection,
    WinCondition,
    WinConditionsList,
    WIN_CONDITION_KINDS,
    WinOperator,
    WinValueSource,
    defaultCondition,
} from './Classes/WinConditions';

const coordListToString = (coordinates: [number, number][]): string => (
    coordinates.map(([x, y]) => `${x},${y}`).join('\n')
);

const parseCoordList = (text: string): [number, number][] => (
    text
        .split(/[\r\n,;]+/)
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
            const match = part.match(/^(\d+)[x,](\d+)$/);
            if (!match) return null;
            return [parseInt(match[1], 10), parseInt(match[2], 10)] as [number, number];
        })
        .filter((c): c is [number, number] => c !== null)
);

const coordToString = (coordinates: [number, number]): string => `${coordinates[0]},${coordinates[1]}`;

const parseSingle = (text: string): [number, number] => {
    const match = text.match(/(\d+)[x,](\d+)/);
    if (!match) return [0, 0];
    return [parseInt(match[1], 10), parseInt(match[2], 10)] as [number, number];
};

function WinConditionsEditor(props: { game: GameSerialized }) {
    const { t } = useTranslation();
    const game = props.game;
    if (!game || !game.object) return null;
    const list: WinConditionsList = game.object.level.winConditions;

    const mutate = (mutator: () => void) => {
        mutator();
        game.object?.render();
    };

    const updateCondition = (index: number, condition: WinCondition) => {
        mutate(() => {
            list.conditions[index] = condition;
        });
    };

    const renderParams = (index: number) => {
        const condition = list.conditions[index];
        if (!condition) return null;
        switch (condition.kind) {
            case 'noBoxes':
                return <span style={{ opacity: 0.6 }}>{t('editor.conditionNoParams')}</span>;
            case 'boxCount':
                return <>
                    <Select
                        variant="standard"
                        value={condition.operator}
                        onChange={e => updateCondition(index, { ...condition, operator: e.target.value as WinOperator })}
                    >
                        {(['eq', 'ne', 'gt', 'ge', 'lt', 'le'] as WinOperator[]).map(op =>
                            <MenuItem key={op} value={op}>{t(`winOperator.${op}`)}</MenuItem>)}
                    </Select>
                    <TextField
                        label={t('editor.value')}
                        variant="standard"
                        type="number"
                        style={{ width: 70 }}
                        value={condition.value}
                        onChange={e => updateCondition(index, { ...condition, value: parseInt(e.target.value, 10) || 0 })}
                    />
                </>;
            case 'cellsHaveItems':
            case 'cellsEmpty':
                return <TextField
                    label={t('editor.coordinates')}
                    variant="standard"
                    multiline
                    style={{ width: 150 }}
                    value={coordListToString(condition.coordinates)}
                    onChange={e => updateCondition(index, { ...condition, coordinates: parseCoordList(e.target.value) })}
                />;
            case 'tagPresent':
            case 'tagAbsent':
                return <TextField
                    label={t('editor.tag')}
                    variant="standard"
                    style={{ width: 110 }}
                    value={condition.tag}
                    onChange={e => updateCondition(index, { ...condition, tag: e.target.value })}
                />;
            case 'characterAt':
                return <TextField
                    label={t('editor.coordinate')}
                    variant="standard"
                    style={{ width: 90 }}
                    value={coordToString(condition.coordinates)}
                    onChange={e => updateCondition(index, { ...condition, coordinates: parseSingle(e.target.value) })}
                />;
            case 'shredded':
                return <>
                    <TextField
                        label={t('editor.coordinate')}
                        variant="standard"
                        style={{ width: 90 }}
                        value={coordToString(condition.coordinates)}
                        onChange={e => updateCondition(index, { ...condition, coordinates: parseSingle(e.target.value) })}
                    />
                    <Select
                        variant="standard"
                        value={condition.operator}
                        onChange={e => updateCondition(index, { ...condition, operator: e.target.value as WinOperator })}
                    >
                        {(['eq', 'ne', 'gt', 'ge', 'lt', 'le'] as WinOperator[]).map(op =>
                            <MenuItem key={op} value={op}>{t(`winOperator.${op}`)}</MenuItem>)}
                    </Select>
                    <TextField
                        label={t('editor.value')}
                        variant="standard"
                        type="number"
                        style={{ width: 70 }}
                        value={condition.value}
                        onChange={e => updateCondition(index, { ...condition, value: parseInt(e.target.value, 10) || 0 })}
                    />
                </>;
            case 'sortedByItemValue':
                return <>
                    <TextField
                        label={t('editor.coordinates')}
                        variant="standard"
                        multiline
                        style={{ width: 150 }}
                        value={coordListToString(condition.coordinates)}
                        onChange={e => updateCondition(index, { ...condition, coordinates: parseCoordList(e.target.value) })}
                    />
                    <Select
                        variant="standard"
                        value={condition.source ?? 'cell'}
                        onChange={e => updateCondition(index, { ...condition, source: e.target.value as WinValueSource })}
                    >
                        <MenuItem value="cell">{t('editor.sourceCell')}</MenuItem>
                        <MenuItem value="character">{t('editor.sourceCharacter')}</MenuItem>
                    </Select>
                    <Select
                        variant="standard"
                        value={condition.ascending ? 'asc' : 'desc'}
                        onChange={e => updateCondition(index, { ...condition, ascending: e.target.value === 'asc' })}
                    >
                        <MenuItem value="asc">{t('editor.ascending')}</MenuItem>
                        <MenuItem value="desc">{t('editor.descending')}</MenuItem>
                    </Select>
                </>;
            case 'neighborCompare':
                return <>
                    <TextField
                        label={t('editor.coordinate')}
                        variant="standard"
                        style={{ width: 90 }}
                        value={coordToString(condition.coordinates)}
                        onChange={e => updateCondition(index, { ...condition, coordinates: parseSingle(e.target.value) })}
                    />
                    <Select
                        variant="standard"
                        value={condition.direction}
                        onChange={e => updateCondition(index, { ...condition, direction: e.target.value as NeighborDirection })}
                    >
                        {(['up', 'down', 'left', 'right'] as NeighborDirection[]).map(dir =>
                            <MenuItem key={dir} value={dir}>{t(`neighborDirection.${dir}`)}</MenuItem>)}
                    </Select>
                    <Select
                        variant="standard"
                        value={condition.operator}
                        onChange={e => updateCondition(index, { ...condition, operator: e.target.value as WinOperator })}
                    >
                        {(['eq', 'ne', 'gt', 'ge', 'lt', 'le'] as WinOperator[]).map(op =>
                            <MenuItem key={op} value={op}>{t(`winOperator.${op}`)}</MenuItem>)}
                    </Select>
                    <Select
                        variant="standard"
                        value={condition.source ?? 'cell'}
                        onChange={e => updateCondition(index, { ...condition, source: e.target.value as WinValueSource })}
                    >
                        <MenuItem value="cell">{t('editor.sourceCell')}</MenuItem>
                        <MenuItem value="character">{t('editor.sourceCharacter')}</MenuItem>
                    </Select>
                </>;
            case 'code':
                return <TextField
                    label={t('editor.customCode')}
                    variant="standard"
                    multiline
                    fullWidth
                    minRows={3}
                    value={condition.code}
                    onChange={e => updateCondition(index, { ...condition, code: e.target.value })}
                    helperText={t('editor.conditionCodeHint')}
                />;
            default:
                return null;
        }
    };

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 900 }}>
        <Select
            variant="standard"
            value={list.mode}
            onChange={e => mutate(() => { list.mode = e.target.value as 'all' | 'any'; })}
        >
            <MenuItem value="all">{t('editor.conditionsAll')}</MenuItem>
            <MenuItem value="any">{t('editor.conditionsAny')}</MenuItem>
        </Select>
        {list.conditions.map((condition, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', border: '1px solid #ddd', padding: 8, borderRadius: 4 }}>
                <Select
                    variant="standard"
                    value={condition.kind}
                    onChange={e => {
                        const kind = e.target.value as WinCondition['kind'];
                        mutate(() => {
                            list.conditions[index] = defaultCondition(kind);
                        });
                    }}
                >
                    {WIN_CONDITION_KINDS.map(kind =>
                        <MenuItem key={kind} value={kind}>{t(`conditionKind.${kind}`)}</MenuItem>)}
                </Select>
                {renderParams(index)}
                <Button size="small" onClick={() => mutate(() => { list.conditions.splice(index, 1); })}>
                    {t('editor.remove')}
                </Button>
            </div>
        ))}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>{t('editor.addCondition')}</span>
            <Select
                variant="standard"
                value=""
                onChange={e => {
                    const kind = e.target.value as WinCondition['kind'];
                    mutate(() => { list.conditions.push(defaultCondition(kind)); });
                }}
            >
                {WIN_CONDITION_KINDS.map(kind =>
                    <MenuItem key={kind} value={kind}>{t(`conditionKind.${kind}`)}</MenuItem>)}
            </Select>
        </div>
    </div>;
}

export default WinConditionsEditor;