export const INT32_MIN = -2147483648;
export const INT32_MAX = 2147483647;

export const clampInt32 = (value: number): number => {
    if (!Number.isFinite(value)) return 0;
    const truncated = Math.trunc(value);
    if (truncated < INT32_MIN) return INT32_MIN;
    if (truncated > INT32_MAX) return INT32_MAX;
    return truncated;
};

class Box {
    isRandom = false;

    value = 0;

    tag: string | null = null;

    destroyed = false;

    constructor(value: number, isRandom?: boolean, min?: number, max?: number) {
        this.isRandom = !!isRandom;
        if (this.isRandom) {
            const lo = min ?? 0;
            const hi = max ?? 99;
            const low = Math.min(lo, hi);
            const high = Math.max(lo, hi);
            this.value = clampInt32(Math.floor(Math.random() * (high - low + 1)) + low);
        } else {
            this.value = clampInt32(value);
        }
    }

    setValue(value: number) {
        this.value = clampInt32(value);
    }

    setTag(tag: string) {
        this.tag = tag;
    }

    destroy() {
        this.destroyed = true;
    }
}

export default Box;
