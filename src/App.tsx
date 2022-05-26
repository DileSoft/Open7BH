import { Checkbox, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import Level from './Level';
import Editor from './Editor';
import levels from './levelsList';
import './App.css';

function App() {
    const [level, setLevel] = useState(0);
    const [editor, setEditor] = useState(false);
    return (
        <div className="App">
            <h1>Open7BH</h1>
            <div>
                Editor:
                {' '}
                <Checkbox onChange={e => setEditor(e.target.checked)} checked={editor} />
            </div>
            {editor ? <Editor /> :
                <>
                    <div>
                        <Select variant="standard" value={level} onChange={e => setLevel(parseInt(e.target.value as string))}>
                            {levels.map((currentLevel, number) => <MenuItem key={number} value={number}>{currentLevel.task}</MenuItem>)}
                        </Select>
                    </div>
                    <Level level={levels[level]} />
                </>}
        </div>
    );
}

export default App;
