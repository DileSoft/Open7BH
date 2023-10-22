class Box {
    isRandom = false;

    value = 0;

    tag:string | null = null;

    constructor(value: number, isRandom?: boolean, min?: number, max?: number) {
        this.value = value;
        this.isRandom = isRandom;
        if (isRandom) {
            this.value = Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    setTag(tag:string) {
        this.tag = tag;
    }
}

export default Box;
