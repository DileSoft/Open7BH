class Box {
    isRandom = false;

    value = 0;

    constructor(value: number, isRandom: boolean | undefined, min: number | undefined, max: number | undefined) {
        this.value = value;
        this.isRandom = isRandom;
        if (isRandom) {
            this.value = Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
}

export default Box;
