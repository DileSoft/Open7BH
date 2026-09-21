import { useTranslation } from 'react-i18next';
import Levels from './Classes/Levels';

/**
 * Small "system / modified / user" badge shown next to a level name in the
 * selects of the game and the editor.
 */
function LevelBadge(props: { name: string }) {
    const { t } = useTranslation();
    const meta = Levels.getMeta(props.name);
    const isSystem = meta ? meta.isSystem : Levels.isSystemName(props.name);
    const modified = !!meta?.modified;

    let label = t('editor.badgeUser');
    let color = '#1565c0';
    if (modified) {
        label = t('editor.badgeModified');
        color = '#e65100';
    } else if (isSystem) {
        label = t('editor.badgeSystem');
        color = '#4c7a28';
    }

    return <span
        style={{
            fontSize: 10,
            lineHeight: '16px',
            color,
            border: `1px solid ${color}`,
            borderRadius: 8,
            padding: '0 6px',
            marginRight: 6,
            whiteSpace: 'nowrap',
        }}
    >
        {label}
    </span>;
}

export default LevelBadge;