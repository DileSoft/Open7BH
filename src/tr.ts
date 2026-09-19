import i18n from './i18n';

export function tr(key: string): string {
    return String(i18n.t(key));
}

export function trOption(group: string, value: string): string {
    return String(i18n.t(`options.${group}.${value}`, { defaultValue: value }));
}
