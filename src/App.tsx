import {
    MenuItem, Select, Tabs, Tab, Button,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Level from './Level';
import Editor from './Editor';
import LevelBadge from './LevelBadge';
import Levels from './Classes/Levels';
import { getLevelTask } from './levelTranslations';
import './App.css';

const theme = createTheme({
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    width: '50px',
                    '& input': { textAlign: 'center' },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                select: {
                    paddingLeft: '24px',
                },
            },
        },
    },
});

Levels.preloadLevels();

function App() {
    const { t, i18n } = useTranslation();
    const [level, setLevel] = useState(0);
    const [editor, setEditor] = useState(false);
    const [levels, setLevels] = useState(Levels.getLevels());
    const reloadLevels = () => setLevels(Levels.getLevels());
    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <h1>Open7BH</h1>
                <div style={{ position: 'absolute', top: 8, right: 16, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 12 }}>{t('app.language')}:</span>
                    <Button size="small" variant={i18n.language === 'en' ? 'contained' : 'outlined'} onClick={() => i18n.changeLanguage('en')}>EN</Button>
                    <Button size="small" variant={i18n.language === 'ru' ? 'contained' : 'outlined'} onClick={() => i18n.changeLanguage('ru')}>RU</Button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Tabs value={editor ? 1 : 0} onChange={(e, value) => setEditor(value === 1)}>
                        <Tab label={t('app.game')} />
                        <Tab label={t('app.editor')} />
                    </Tabs>
                </div>
                {editor ? <Editor levels={levels} reloadLevels={reloadLevels} /> :
                    <>
                        <div>
                            <Select variant="standard" value={level} onChange={e => setLevel(parseInt(e.target.value as string))}>
                                {levels.map((currentLevel, number) => <MenuItem key={number} value={number}>
                                    <LevelBadge name={currentLevel.name} />
                                    {getLevelTask(currentLevel)}
                                </MenuItem>)}
                            </Select>
                        </div>
                        <Level level={levels[level]} levelNumber={level} />
                    </>}
            </div>
        </ThemeProvider>
    );
}
export default App;
