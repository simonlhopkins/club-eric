export class Util {
  static mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  static mapRangeClamped(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ) {
    return Util.clamp(
      Util.mapRange(value, inMin, inMax, outMin, outMax),
      outMin,
      outMax
    );
  }

  static getRandomElement<T>(array: T[]): T | null {
    if (array.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  static averageArray(array: Float32Array | number[]): number {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / array.length;
  }

  static rootMeanSquared(array: Float32Array | number[]) {
    // const average = Util.averageArray(array);
    let sumSquares = 0;
    for (let i = 0; i < array.length; i++) {
      sumSquares += Math.pow(array[i], 2);
    }

    return Math.sqrt(sumSquares / array.length);
  }

  static movingAverage(data: number[], windowSize: number): number[] {
    if (windowSize <= 0) {
      throw new Error("Window size must be greater than zero");
    }

    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const average = this.averageArray(
        data.slice(Math.max(0, i - windowSize), i)
      );
      // if (i < windowSize - 1) {
      //   result.push(data[i]); // Not enough data points for a full window
      // } else {
      //   let sum = 0;
      //   for (let j = 0; j < windowSize; j++) {
      //     sum += data[i - j];
      //   }

      //   result.push(sum / windowSize);
      // }
      result.push(average);
    }
    return result;
  }

  static standardDeviation(arr: number[]) {
    const average = Util.averageArray(arr);
    return Math.sqrt(
      Util.averageArray(arr.map((i) => Math.pow(i - average, 2)))
    );
  }
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static findMin(array: number[]): number | undefined {
    if (array.length === 0) return undefined;
    return array.reduce(
      (min, current) => (current < min ? current : min),
      array[0]
    );
  }
  static findMax(array: number[]): number | undefined {
    if (array.length === 0) return undefined;
    return array.reduce(
      (max, current) => (current > max ? current : max),
      array[0]
    );
  }
}
