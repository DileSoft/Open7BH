import logo from './logo.svg';
import './App.css';
import Level from './Level';
import { parseCells } from './Utils';
import levels from './levels';

const level = levels[0];

function App() {
    return (
        <div className="App">
            <Level level={level} />
        </div>
    );
}

export default App;
