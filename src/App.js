import logo from './logo.svg';
import './App.css';
import Level from './Level';
import { parseCells } from './Utils';
import levels from './levels';
import { MenuItem, Select } from '@mui/material';
import { useState } from 'react';

function App() {
    const [level, setLevel] = useState(0);
    return (
        <div className="App">
            <Select variant="standard" value={level} onChange={e => setLevel(e.target.value)}>
                {levels.map((currentLevel, number) => <MenuItem value={number}>{currentLevel.task}</MenuItem>)}
            </Select>
            <Level level={levels[level]} />
        </div>
    );
}

export default App;
