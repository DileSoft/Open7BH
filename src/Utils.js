export const parseCoordinates = cellCoordinate => cellCoordinate.split('x').map(value => parseInt(value));

export const parseCells = cellsStr => {
    const result = {};
    cellsStr.split(/[\r\n]+/).forEach((line, lineIndex) => {
        line.split(/ +/).forEach((cell, cellIndex) => {
            const cellData = cell.split('|');
            const cellObject = {
                type: cellData[0],
            };
            if (cellObject.type === 'box') {
                cellObject.value = cellData[1];
            }
            result[`${cellIndex}x${lineIndex}`] = cellObject;
        });
    });

    return result;
};

export const randomArray = array => array[Math.floor(Math.random() * array.length)];

export const moveCoordinates = (coordinates, direction) => {
    const newCoordinates = [...coordinates];
    if (direction === 'left') {
        newCoordinates[0] -= 1;
    }
    if (direction === 'right') {
        newCoordinates[0] += 1;
    }
    if (direction === 'top') {
        newCoordinates[1] -= 1;
    }
    if (direction === 'bottom') {
        newCoordinates[1] += 1;
    }

    return newCoordinates;
};
