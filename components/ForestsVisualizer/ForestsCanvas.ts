import { GeometryHelpers, Rect } from "@/lib/Geometry/Geometry";
import { easing } from "ts-easing";
import { Util } from "../Util";
import EnergyAnalyzer from "./EnergyAnalyzer";
import ForestsAnalyzer from "./ForestsAnalyzer";

interface CanvasPosition {
  x: number;
  y: number;
}

interface FlameAnchors {
  left: CanvasPosition;
  right: CanvasPosition;
}

const k_letterPositions: { [key: string]: CanvasPosition } = {
  f: { x: 24, y: 16 },
  o: { x: 178, y: 67 },
  r: { x: 320, y: 64 },
  e: { x: 457, y: 58 },
  s: { x: 578, y: 60 },
  t: { x: 704, y: 58 },
  s2: { x: 828, y: 58 },
};

const k_petalPositions: { [key: string]: CanvasPosition } = {
  petal1: { x: 502, y: 517 },
  petal2: { x: 519, y: 543 },
  petal3: { x: 527, y: 573 },
  petal4: { x: 507, y: 595 },
  petal5: { x: 487, y: 610 },
  petal6: { x: 457, y: 604 },
  petal7: { x: 429, y: 585 },
  petal8: { x: 421, y: 559 },
  petal9: { x: 429, y: 533 },
  petal10: { x: 455, y: 507 },
};
const k_flowerCenterPosition: CanvasPosition = { x: 465, y: 553 };

class CanvasImage {
  image: HTMLImageElement;
  src: string | null = null;
  width: number = 0;
  height: number = 0;
  constructor() {
    this.image = new Image();
  }
  async load(_src: string) {
    return new Promise<void>((resolve, reject) => {
      this.image.src = _src;
      this.image.onload = () => {
        this.width = this.image.width;
        this.height = this.image.height;
        resolve();
      };
      this.image.onerror = () => {
        reject();
      };
    });
  }
}

class ForestsCanvas {
  analyzer: ForestsAnalyzer;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  screenRect: Rect;
  bgImage: CanvasImage;
  letters: Map<string, CanvasImage>;
  petals: Map<string, CanvasImage>;
  flowerCenter: CanvasImage;
  pinkHead: CanvasImage;
  flameTall: CanvasImage;
  flameShort: CanvasImage;
  flameMed: CanvasImage;
  imageLoadPromises: Promise<void>[] = [];

  private debugTextY: number = 0;
  constructor(_analyzer: ForestsAnalyzer, _canvas: HTMLCanvasElement) {
    this.analyzer = _analyzer;
    this.canvas = _canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.screenRect = new Rect(0, 0, this.canvas.width, this.canvas.height);
    this.bgImage = this.loadImage("/forests-cover_bg.jpg");
    this.letters = new Map(
      [..."forest".split(""), "s2"].map((letter) => [
        letter,
        this.loadImage(`/forests_${letter}.png`),
      ])
    );
    this.petals = new Map(
      Array(10)
        .fill("petal")
        .map((value, i) => [
          `petal${i + 1}`,
          this.loadImage(`/petal${i + 1}.png`),
        ])
    );
    this.flowerCenter = this.loadImage("/center.png");
    this.pinkHead = this.loadImage("/pinkHead.png");
    this.flameTall = this.loadImage("/flameTall.png");
    this.flameShort = this.loadImage("/flameShort.png");
    this.flameMed = this.loadImage("/flameMedium.png");
    Promise.all(this.imageLoadPromises).then(() => {
      this.draw();
    });
  }

  loadImage(src: string) {
    const ret = new CanvasImage();
    this.imageLoadPromises.push(ret.load("/forestsVisualizer" + src));
    return ret;
  }

  play() {}
  pause() {}

  drawFlower() {
    const maxFrequency = ForestsAnalyzer.getSampleRate() / 2;
    let i = 0;
    const numPetals = this.petals.size;
    this.petals.forEach((value, key) => {
      const image = value.image;
      const lower = Util.mapRange(i, 0, numPetals, 0, maxFrequency);
      const upper = Util.mapRange(i + 1, 0, numPetals, 0, maxFrequency);
      const bucket = this.analyzer.getEnergyBins(20, lower, upper);

      const average = Util.averageArray(bucket);
      const baseRect = new Rect(
        k_petalPositions[key].x,
        k_petalPositions[key].y,
        image.width,
        image.height
      );

      const angle =
        Util.mapRange(i, 0, numPetals, 0, Math.PI * 2) - Math.PI / 3;

      const mod = Number.isFinite(average)
        ? Util.mapRangeClamped(average, 60, 85, 0, 1)
        : 0;
      const scale = Util.mapRange(mod, 0, 1, 0.8, 2);
      const xPivot =
        k_flowerCenterPosition.x +
        this.flowerCenter.image.width / 2 +
        Math.cos(angle) * 30;
      const yPivot =
        k_flowerCenterPosition.y +
        this.flowerCenter.image.height / 2 +
        Math.sin(angle) * 30;
      const scaledRect = baseRect.scaleFromPoint(xPivot, yPivot, scale);

      this.ctx.drawImage(
        image,
        scaledRect.x,
        scaledRect.y,
        scaledRect.width,
        scaledRect.height
      );

      i++;
    });
    this.ctx.drawImage(
      this.flowerCenter.image,
      k_flowerCenterPosition.x,
      k_flowerCenterPosition.y,
      this.flowerCenter.width,
      this.flowerCenter.height
    );
  }

  drawImageRotatedAroundPoint(
    image: CanvasImage,
    imageRect: Rect,
    anchor: CanvasPosition,
    degrees: number
  ) {
    this.ctx.save();

    this.ctx.translate(anchor.x, anchor.y);

    this.ctx.rotate(degrees);
    this.ctx.drawImage(
      image.image,
      imageRect.x - anchor.x,
      imageRect.y - anchor.y,
      imageRect.width,
      imageRect.height
    );
    this.ctx.restore();
  }

  drawFlame() {
    let bins = this.analyzer.getWaveformBins(32);
    bins = Util.movingAverage(bins, 8);
    this.ctx.lineWidth = 5;
    const start = { x: 801, y: 529 };
    const width = 200;
    this.drawDebugAnalyzer(this.analyzer.waveformAnalyzer, "waveform");
    const latest = this.analyzer.waveformAnalyzer.getLatestEnergy();
    if (latest) {
      if (latest.zScore > 2) {
        const center = this.screenRect.getCenter();
        this.drawCircle(40, center[0], center[1]);
      }
      console.log(latest.zScore);
    }
    // const tallOffsets: FlameAnchors = {
    //   left: {
    //     x: 30,
    //     y: 80,
    //   },
    //   right: {
    //     x: 65,
    //     y: 79,
    //   },
    // };

    // const shortOffsets: FlameAnchors = {
    //   left: {
    //     x: 15,
    //     y: 35,
    //   },
    //   right: {
    //     x: 36,
    //     y: 35,
    //   },
    // };
    // const mediumOffset: FlameAnchors = {
    //   left: {
    //     x: 19,
    //     y: 49,
    //   },
    //   right: {
    //     x: 46,
    //     y: 47,
    //   },
    // };

    // let currentAnchorX = start.x;
    // let num = 0;
    // this.drawDebugText(this.analyzer.lowAnalyzer.getDebugText());
    // this.drawDebugText(this.analyzer.highsAnalyzer.getDebugText());
    // while (currentAnchorX > start.x - width) {
    //   const indexToLookAt = Math.floor(
    //     Util.mapRange(currentAnchorX, start.x, start.x - width, 0, bins.length)
    //   );

    //   // const percent =
    //   //   num % 2 == 0
    //   //     ? this.analyzer.lowAnalyzer.getAnalyzerPecent(40, 42)
    //   //     : this.analyzer.highsAnalyzer.getAnalyzerPecent(34, 36);
    //   const percent = Util.mapRangeClamped(bins[indexToLookAt], -1, 1, 0, 1);
    //   let offset;
    //   let image;

    //   if (percent < 0.6) {
    //     offset = shortOffsets;
    //     image = this.flameShort;
    //   } else if (percent < 0.65) {
    //     offset = mediumOffset;
    //     image = this.flameMed;
    //   } else {
    //     offset = tallOffsets;
    //     image = this.flameTall;
    //   }

    //   const targetRect = Rect.fromBottomRight(
    //     currentAnchorX + (image.width - offset.right.x),
    //     start.y,
    //     image.width,
    //     image.height
    //   );
    //   currentAnchorX -= offset.right.x - offset.left.x;
    //   this.ctx.drawImage(
    //     image.image,
    //     targetRect.x,
    //     targetRect.y,
    //     targetRect.width,
    //     targetRect.height
    //   );

    //   this.ctx.save();
    //   this.ctx.translate(targetRect.x, targetRect.y + targetRect.height * 2);
    //   this.ctx.scale(1, -1);
    //   this.ctx.drawImage(
    //     image.image,
    //     0,
    //     0,
    //     targetRect.width,
    //     targetRect.height
    //   );
    //   this.ctx.restore();

    //   num++;
    // }

    for (let i = 0; i < bins.length; i++) {
      this.ctx.beginPath();
      const x = Util.mapRange(i, 0, bins.length, start.x, start.x + width);
      const height = Util.mapRange(bins[i], 0, 1, 0, 100);
      const y1 = start.y - height;
      const y2 = start.y + height;
      const angle = -Math.PI * 0.84;
      const p1 = GeometryHelpers.rotateAroundPoint(
        x,
        y1,
        start.x,
        start.y,
        angle
      );
      const p2 = GeometryHelpers.rotateAroundPoint(
        x,
        y2,
        start.x,
        start.y,
        angle
      );

      this.ctx.moveTo(p1[0], p1[1]);
      this.ctx.lineTo(p2[0], p2[1]);

      this.ctx.stroke();
    }
  }

  drawLetters() {
    let lowMod =
      this.analyzer.getPeakPercent(this.analyzer.lowAnalyzer, 0.2) || 0;
    let midMod =
      this.analyzer.getPeakPercent(this.analyzer.midsAnalyzer, 0.2) || 0;
    let highMod =
      this.analyzer.getPeakPercent(this.analyzer.highsAnalyzer, 0.2) || 0;

    let i = 0;
    const sizeMod = 0.8;

    this.letters.forEach((value, key) => {
      const mod = Math.max(0, i % 2 == 0 ? lowMod : highMod);
      const startRect = new Rect(
        k_letterPositions[key].x,
        k_letterPositions[key].y,
        value.width,
        value.height
      );
      const minRect = startRect.scaleFromPoint(
        startRect.getCenter()[0],
        startRect.getCenter()[1],
        sizeMod
      );

      const easedMod = easing.inOutQuad(mod);
      const drawRect = Rect.lerpRects(startRect, minRect, easedMod);
      this.ctx.drawImage(
        value.image,
        drawRect.x,
        drawRect.y,
        drawRect.width,
        drawRect.height
      );
      i++;
    });
  }

  drawPinkHead() {
    const energy = this.analyzer.lowAnalyzer.getLatestEnergy()?.movingAverage;
    const baseRect = new Rect(
      464,
      602,
      this.pinkHead.width,
      this.pinkHead.height
    );

    const minAngle = -Math.PI / 16;
    const maxAngle = Math.PI / 16;
    // const p = this.analyzer.getPeakPercent(this.analyzer.lowAnalyzer, 0.4);
    let percentOfMax =
      energy != null ? Util.mapRangeClamped(energy, 88, 93, 0, 1) : 0;
    const mostRecentEnergt = this.analyzer.lowAnalyzer.getLatestEnergy();
    percentOfMax = mostRecentEnergt
      ? Util.mapRangeClamped(mostRecentEnergt.zScore, 0.5, 2, 0, 1)
      : 0;
    // const modPercentOfMax = easing.inOutQuad(percentOfMax);
    const rotateAmount = Util.mapRange(percentOfMax, 0, 1, minAngle, maxAngle);

    const anchor = { x: 605, y: 705 };
    const pos = { x: 464, y: 602 };

    this.drawImageRotatedAroundPoint(
      this.pinkHead,
      new Rect(pos.x, pos.y, this.pinkHead.width, this.pinkHead.height),
      anchor,
      -rotateAmount
    );
  }
  draw() {
    this.debugTextY = 0;
    const map = Util.mapRange;
    this.analyzer.updateAverages();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.bgImage.image,
      0,
      0,
      this.bgImage.width,
      this.bgImage.height
    );

    //letters
    this.drawLetters();
    //flower
    this.drawFlower();
    this.drawPinkHead();
    this.drawFlame();
    this.drawDebugText(`low: ${this.analyzer.lowAnalyzer.getDebugText()}`);
    //show the averages
    // this.drawDebug();
  }

  drawDebugAnalyzer(analyzer: EnergyAnalyzer, name: string) {
    const data = analyzer.data;
    const minTime = this.analyzer.getCurrentTime() - analyzer.getAnalysisTime();
    for (let i = 1; i < data.length; i++) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = data[i].isPeak ? "orange" : "purple";

      let numPoints = 0;
      const slopes = [];
      for (let i = data.length - 2; i > data.length - 10; i--) {
        if (i > 0 && data[i].energy < data[i + 1].energy) {
          slopes.push((data[i + 1].energy - data[i].energy) / 2);
          numPoints++;
        } else {
          break;
        }
      }
      const averageSlope = Util.averageArray(slopes);
      const distance = GeometryHelpers.calculateDistance(
        data.length - 1 - numPoints,
        data[data.length - 1 - numPoints].energy,
        data.length - 1,
        data[data.length - 1].energy
      );

      console.log(averageSlope, distance);
      this.ctx.lineWidth = 5;
      const x1 = Util.mapRange(
        data[i - 1].time,
        minTime,
        this.analyzer.getCurrentTime(),
        0,
        this.canvas.width
      );
      const y1 = Util.mapRange(
        data[i - 1].energy,
        analyzer.min,
        analyzer.max,
        this.canvas.height,
        0
      );
      const x2 = Util.mapRange(
        data[i].time,
        minTime,
        this.analyzer.getCurrentTime(),
        0,
        this.canvas.width
      );
      const y2 = Util.mapRange(
        data[i].energy,
        analyzer.min,
        analyzer.max,
        this.canvas.height,
        0
      );
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    this.drawDebugText(`${name} = ${analyzer.getDebugText()}`);
  }

  drawDebug() {
    // this.drawDebugAnalyzer(this.analyzer.vocalsAnalyzer, "vocals");
    this.drawFFTSlice(200, 600);
    // this.drawSpectrum(this.computeHHP(), 0, 1000000);

    // const latestMidEnergy = this.analyzer.midsAnalyzer.getLatestEnergy();
    // if (latestMidEnergy) {
    //   const higherThanAverage =
    //     latestMidEnergy.energy > this.analyzer.midsAnalyzer.average;
    //   const highStd = this.analyzer.midsAnalyzer.stdDev > 0.3;
    //   if (higherThanAverage && highStd) {
    //     this.drawCircle(30, 300, 300);
    //   }
    // }
  }

  computeHHP() {
    // const fft = this.analyzer.getValues();
    const slice = this.analyzer.getEnergyBins(1024, 0, 512);
    let hhp: number[] = Array(slice.length).fill(1);

    for (let i = 1; i < 4; i++) {
      const downsampled: number[] = [];
      for (let j = 0; j < slice.length; j += i) {
        downsampled.push(slice[j]);
      }
      for (let j = 0; j < downsampled.length; j++) {
        hhp[j] *= downsampled[j];
      }
    }

    return hhp.slice(0, hhp.length / 4);
  }

  drawSpectrum(spectrum: number[], yMin: number, yMax: number) {
    for (let i = 1; i < spectrum.length; i++) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = "black";
      this.ctx.lineWidth = 5;

      const x1 = Util.mapRange(i - 1, 0, spectrum.length, 0, this.canvas.width);
      const y1 = Util.mapRange(
        spectrum[i - 1],
        yMin,
        yMax,
        this.canvas.height,
        0
      );
      const x2 = Util.mapRange(i, 0, spectrum.length, 0, this.canvas.width);
      const y2 = Util.mapRange(spectrum[i], yMin, yMax, this.canvas.height, 0);

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  drawFFTSlice(min?: number, max?: number) {
    min = min || 0;
    max = max || 22000;
    const fftData = this.analyzer.getFFTValues();
    const bins = this.analyzer.getEnergyBins(512, min, max, fftData);
    const indexOfMin = this.analyzer.getIndexOfFrequency(min);
    const indexOfMax = this.analyzer.getIndexOfFrequency(max);
    const indexStep = (indexOfMax - indexOfMin) / 512;
    let approxIndex = indexOfMin;
    for (let i = 1; i < bins.length; i++) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = "black";
      this.ctx.lineWidth = 5;

      const frequency = this.analyzer.getFrequencyOfIndex(approxIndex);
      const x1 = Util.mapRange(i - 1, 0, bins.length, 0, this.canvas.width);
      const y1 = Util.mapRange(bins[i - 1], 0, 100, this.canvas.height, 0);
      const x2 = Util.mapRange(i, 0, bins.length, 0, this.canvas.width);
      const y2 = Util.mapRange(bins[i], 0, 100, this.canvas.height, 0);
      if (i % 36 == 0) {
        this.drawText(Math.floor(frequency).toString(), x1, y1 - 20, "white");
      }
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
      approxIndex += indexStep;
    }
  }

  drawCircle(radius: number, x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.arc(95, 50, 40, 0, 2 * Math.PI);
    this.ctx.stroke();
  }
  drawText(text: string, x: number, y: number, color?: string) {
    this.ctx.fillStyle = color || "black";
    this.ctx.font = "18px serif";
    this.ctx.fillText(text, x, y);
  }
  drawDebugText(text: string) {
    this.ctx.fillStyle = "red";
    this.ctx.font = "18px serif";
    this.ctx.fillText(text, 20, this.debugTextY + 30);
    this.debugTextY += 20;
  }
}

export default ForestsCanvas;
