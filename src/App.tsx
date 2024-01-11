import {
    MenuItem, Select, Tabs, Tab,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import Level from './Level';
import Editor from './Editor';
import Levels from './Classes/Levels';
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
    const [level, setLevel] = useState(0);
    const [editor, setEditor] = useState(false);
    const [levels, setLevels] = useState(Levels.getLevels());
    const reloadLevels = () => setLevels(Levels.getLevels());
    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <h1>Open7BH</h1>
                <Tabs value={editor ? 1 : 0} onChange={(e, value) => setEditor(value === 1)}>
                    <Tab label="Game" />
                    <Tab label="Editor" />
                </Tabs>
                {editor ? <Editor levels={levels} reloadLevels={reloadLevels} /> :
                    <>
                        <div>
                            <Select variant="standard" value={level} onChange={e => setLevel(parseInt(e.target.value as string))}>
                                {levels.map((currentLevel, number) => <MenuItem key={number} value={number}>{currentLevel.level.task}</MenuItem>)}
                            </Select>
                        </div>
                        <Level level={levels[level]} levelNumber={level} />
                    </>}
            </div>
        </ThemeProvider>
    );
}
export default App;
