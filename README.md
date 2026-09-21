# Open7BH

Non-commercial open source game inspired by 7 billion humans (and that there is no level editor for it).

Game demo is here: https://dilesoft.github.io/Open7BH/ It updates automatically.

Game written by React and worked in browser without server

## Level editor

The game has a built-in level editor (tab **Editor**). It can export any level as a JSON file that
you can add to the game source code.

### How to add a level exported from the editor

1. Open the game → tab **Editor** (Редактор). Build or modify the level:
   - cells: click a cell in the "Cells (Old)" grid and pick its type, box value,
     box tag / random flag, printer min/max/fixed;
   - characters: name, color and localized names;
   - **Win conditions**: a declarative list of conditions (no code) — add/remove entries,
     switch "all conditions must hold" / "any condition is enough".
2. Click **Download JSON** (Скачать JSON). Save the file as `src/Classes/Levels/level8.json`
   (pick the next free number).
3. Register the level in `src/levelsList.tsx`:

   ```ts
   import level8 from './Classes/Levels/level8.json';
   // ...
   const levels: GameSerialized[] = [level1, /* ... */ level7, parseLevelJson(level8 as LevelJsonFormat)];
   ```

   (`src/Classes/Levels/level8.json` already exists as a demo level connected this way.)

Alternatively **Copy as TS** (Копировать как TS) generates a ready-made `levelN.tsx` module that
matches the existing code levels.

The exported JSON file contains no functions — the win condition is a declarative
`winConditions` list. Old levels that used a `winCallback` function are automatically converted
into a "custom code" condition when loaded (backwards compatibility for previously saved levels).

### Win condition kinds

- `noBoxes` — no boxes left anywhere;
- `boxCount` — how many boxes remain (operator + value);
- `cellsHaveItems` / `cellsEmpty` — boxes present / empty on every listed cell;
- `tagPresent` / `tagAbsent` — a box with the given tag exists / does not exist;
- `characterAt` — a character stands on the cell;
- `shredded` — how many boxes a shredder destroyed (operator + value);
- `sortedByItemValue` — box values along the listed cells are monotonic (ascending/descending);
- `neighborCompare` — box value on a cell compared with the value on the neighbor cell
  (direction + operator) — useful for "sort this row" tasks;
- `code` — advanced fallback: body of a `level => …` function.