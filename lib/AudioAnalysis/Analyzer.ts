import EnergyAnalyzer from "@/components/ForestsVisualizer/EnergyAnalyzer";
import { Util } from "@/components/Util";
import * as Tone from "tone";

class Mp3Analyzer {
  url: string;
  player: Tone.Player = new Tone.Player();
  gain: Tone.Gain = new Tone.Gain(1);
  fft: Tone.FFT = new Tone.FFT(1024);
  waveform: Tone.Waveform = new Tone.Waveform(1024);
  songLoaded: boolean = false;

  lowAnalyzer: EnergyAnalyzer = new EnergyAnalyzer();
  midsAnalyzer: EnergyAnalyzer = new EnergyAnalyzer();
  vocalsAnalyzer: EnergyAnalyzer = new EnergyAnalyzer(2);
  highsAnalyzer: EnergyAnalyzer = new EnergyAnalyzer();

  waveformAnalyzer: EnergyAnalyzer = new EnergyAnalyzer(4);
  isInitializing = false;

  offset = 0;
  playTime = 0;
  constructor(url: string) {
    this.url = url;
    this.player.connect(this.fft);
    this.player.connect(this.waveform);
    this.fft.connect(this.gain);
    this.gain.toDestination();
    console.log("constructor");
  }

  async init() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    await this.player.load(this.url);
    this.songLoaded = true;
    console.log("song loaded");
  }

  cleanup() {
    this.player.unsync();
    this.stop();
    console.log("unsync");
  }
  static getLowRange() {
    return { low: 60, high: 250 };
  }
  static getMidRange() {
    return { low: 500, high: 2000 };
  }
  static getHighRange() {
    return { low: 6000, high: 20000 };
  }

  update() {
    const time = Tone.getTransport().seconds;
    const values = this.getFFTValues();
    const lows = this.getEnergyBins(
      20,
      Mp3Analyzer.getLowRange().low,
      Mp3Analyzer.getLowRange().high,
      values
    );
    const mids = this.getEnergyBins(
      50,
      Mp3Analyzer.getMidRange().low,
      Mp3Analyzer.getMidRange().high,
      values
    );
    const vocals = this.getEnergyBins(50, 200, 700, values);
    const highs = this.getEnergyBins(
      50,
      Mp3Analyzer.getHighRange().low,
      Mp3Analyzer.getHighRange().high,
      values
    );

    this.lowAnalyzer.addPoint(time, Util.rootMeanSquared(lows));
    this.midsAnalyzer.addPoint(time, Util.rootMeanSquared(mids));
    this.vocalsAnalyzer.addPoint(time, Util.rootMeanSquared(vocals));
    this.highsAnalyzer.addPoint(time, Util.rootMeanSquared(highs));
    this.waveformAnalyzer.addPoint(
      time,
      Util.rootMeanSquared(this.getWaveformValues())
    );
  }

  getCurrentTime() {
    return Tone.getTransport().seconds;
  }
  fastForward(seconds: number) {
    this.stop();
    this.offset += seconds;
    this.start();
  }
  pause() {
    this.offset += Tone.getContext().currentTime - this.playTime;
    this.stop();
  }
  async start() {
    if (this.songLoaded) {
      if (Tone.getContext().state == "suspended") {
        console.log("Tone context is suspended");
        await Tone.start();
      }
      this.playTime = Tone.now();
      console.log("offset: " + this.offset);
      this.player.start(Tone.now(), this.offset);
      this.lowAnalyzer.clear();
      this.midsAnalyzer.clear();
      this.highsAnalyzer.clear();
    }
  }

  stop() {
    this.player.stop();
  }

  mute() {
    this.gain.gain.value = 0;
  }
  unmute() {
    this.gain.gain.value = 1;
  }
  //TODO: credit this person https://tone-demos.glitch.me/
  getEnergyBins(
    size: number,
    _minFrequency?: number,
    _maxFrequency?: number,
    _values?: Float32Array
  ) {
    let bins = [];
    const minFrequency = _minFrequency || 0;
    const maxFrequency = _maxFrequency || Tone.getContext().sampleRate / 2;
    const values = _values || this.getFFTValues();
    for (let i = 0; i < size - 1; i++) {
      const f1 = Util.mapRange(i, 0, size, minFrequency, maxFrequency);
      const f2 = Util.mapRange(i + 1, 0, size, minFrequency, maxFrequency);
      const index1 = this.getIndexOfFrequency(f1);
      const index2 = this.getIndexOfFrequency(f2);

      const energy =
        index2 - index1 > 1
          ? Util.rootMeanSquared(values.slice(index1, index2))
          : values[index1];

      bins.push(energy);
    }
    return bins;
  }
  getWaveformBins(size: number) {
    const values = this.getWaveformValues();
    const bins = [];
    for (let i = 0; i < size - 1; i++) {
      const index1 = Math.floor(Util.mapRange(i, 0, size, 0, values.length));
      const index2 = Math.floor(
        Util.mapRange(i + 1, 0, size, 0, values.length)
      );

      const energy =
        index2 - index1 > 0
          ? Util.rootMeanSquared(values.slice(index1, index2))
          : values[index1];
      bins.push(energy);
    }

    return bins;
  }

  getIndexOfFrequency(hz: number) {
    const nyquist = Tone.getContext().sampleRate / 2;
    const frequencyBinCount = this.fft.size;
    return Math.max(
      0,
      Math.min(
        frequencyBinCount - 1,
        Math.floor((hz / nyquist) * frequencyBinCount)
      )
    );
  }
  getFrequencyOfIndex(index: number): number {
    const nyquist = Tone.getContext().sampleRate / 2;
    const frequencyBinCount = this.fft.size;
    return (index / frequencyBinCount) * nyquist;
  }

  getFFTValues() {
    return this.fft.getValue().map((i) => Util.mapRange(i, -150, -20, 0, 100));
  }
  getWaveformValues() {
    const ret = this.waveform.getValue();
    return ret;
  }

  isPlaying() {
    return this.player.state == "started";
  }

  getPeakPercent(energyAnalyzer: EnergyAnalyzer, falloff: number) {
    const latestHighPeak = energyAnalyzer.getLatestPeak();
    if (latestHighPeak != null) {
      //number from 0 to 1 that is how much we should lerp to the low value
      return Util.mapRange(
        this.getCurrentTime(),
        latestHighPeak.time,
        latestHighPeak.time + falloff,
        1,
        0
      );
    }
    return null;
  }
}

export default Mp3Analyzer;
