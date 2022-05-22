import { MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import Level from './Level';
import levels from './levelsList';
import './App.css';

function App() {
    const [level, setLevel] = useState(0);
    return (
        <div className="App">
            <h1>Open7BH</h1>
            <Select variant="standard" value={level} onChange={e => setLevel(parseInt(e.target.value as string))}>
                {levels.map((currentLevel, number) => <MenuItem value={number}>{currentLevel.task}</MenuItem>)}
            </Select>
            <Level level={levels[level]} />
        </div>
    );
}

export default App;
