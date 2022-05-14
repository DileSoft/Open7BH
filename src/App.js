import { MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import Level from './Level.tsx';
import levels from './levels.tsx';
import './App.css';

function App() {
    const [level, setLevel] = useState(0);
    return (
        <div className="App">
            <h1>Open7BH</h1>
            <Select variant="standard" value={level} onChange={e => setLevel(e.target.value)}>
                {levels.map((currentLevel, number) => <MenuItem value={number}>{currentLevel.task}</MenuItem>)}
            </Select>
            <Level level={levels[level]} />
        </div>
    );
}

export default App;
