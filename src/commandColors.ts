import { OperatorType } from './Classes/Operators/Operator';

export interface CommandGroup {
    titleKey: string;
    color: string;
    commands: OperatorType[];
}

// end* (EndForeach, EndIf) скрыты в панели — появляются автоматически,
// но в коде красятся тем же цветом, что и группа «Управление кодом».
export const COMMAND_GROUPS: CommandGroup[] = [
    { titleKey: 'groups.movement', color: '#1976d2', commands: [OperatorType.Step] },
    { titleKey: 'groups.transfer', color: '#2e7d32', commands: [OperatorType.Pickup, OperatorType.Drop, OperatorType.Take, OperatorType.Give] },
    { titleKey: 'groups.control', color: '#ed6c02', commands: [OperatorType.Goto, OperatorType.If, OperatorType.Foreach, OperatorType.Lose, OperatorType.End] },
    { titleKey: 'groups.memory', color: '#9c27b0', commands: [OperatorType.Variable, OperatorType.Write, OperatorType.Near, OperatorType.Calc] },
    { titleKey: 'groups.communication', color: '#0097a7', commands: [OperatorType.Say, OperatorType.Hear] },
];

const COLOR_BY_COMMAND = new Map<OperatorType, string>();
COMMAND_GROUPS.forEach((group) => {
    group.commands.forEach((command) => COLOR_BY_COMMAND.set(command, group.color));
});
// Авто-концы красим как «Управление кодом».
COLOR_BY_COMMAND.set(OperatorType.EndIf, '#ed6c02');
COLOR_BY_COMMAND.set(OperatorType.EndForeach, '#ed6c02');

export function getOperatorColor(type: OperatorType): string {
    return COLOR_BY_COMMAND.get(type) ?? '#000000';
}
