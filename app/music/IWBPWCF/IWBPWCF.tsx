"use client";
import { Util } from "@/components/Util";
import Mp3Analyzer from "@/lib/AudioAnalysis/Analyzer";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const IWBPWCF = () => {
  const analyzer = useRef<Mp3Analyzer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lows, setLows] = useState(0);
  const [mids, setMids] = useState(0);
  const [highs, setHighs] = useState(0);
  const [hoverFreq, setHoverFreq] = useState(0);

  const getAnalyzer = () => {
    if (!analyzer.current) {
      analyzer.current = new Mp3Analyzer(
        "/audio/Lemon Meringue Die - nobody wouldn't see good things - 08 i would be people who could fly.mp3"
      );
    }
    return analyzer.current;
  };

  useEffect(() => {
    const init = async () => {
      await getAnalyzer().init();
      setIsLoading(false);
    };
    init();
  }, []);
  //update loop
  useEffect(() => {
    const update = () => {
      if (getAnalyzer().isPlaying()) {
        getAnalyzer().update();
        setLows(getAnalyzer().lowAnalyzer.getLatestEnergy()?.energy || 0);
        setMids(getAnalyzer().midsAnalyzer.getLatestEnergy()?.energy || 0);
        setHighs(getAnalyzer().highsAnalyzer.getLatestEnergy()?.energy || 0);
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d")!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          drawFFTSlice(getAnalyzer(), canvas);
        }
      }
    };
    window.setInterval(update, (1 / 30) * 1000);
  }, []);

  //mouse events

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const worldSpaceX = Util.mapRangeClamped(
        event.clientX,
        rect.left,
        rect.right,
        0,
        canvas.width
      );
      const worldSpaceY = Util.mapRangeClamped(
        event.clientY,
        rect.top,
        rect.bottom,
        0,
        canvas.height
      );

      const index = Util.mapRange(
        event.clientX,
        rect.left,
        rect.right,
        0,
        getAnalyzer().fft.size
      );
      setHoverFreq(getAnalyzer().getFrequencyOfIndex(index));
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const midScale = Util.mapRangeClamped(lows, 70, 90, 1, 5);

  return (
    <>
      <button
        onClick={async () => {
          if (!getAnalyzer().isPlaying()) {
            await getAnalyzer().start();
          } else {
            getAnalyzer().pause();
          }
        }}
        disabled={isLoading}
        aria-disabled={isLoading}
      >
        <img src="/icons/AniWavplay.gif"></img>
      </button>
      <button
        style={{
          zIndex: 100,
          position: "relative",
        }}
        onClick={() => {
          getAnalyzer().fastForward(10);
        }}
      >
        fast forward
      </button>
      <canvas ref={canvasRef} width={400} height={300}></canvas>
      <dl style={{ zIndex: 100, position: "relative" }}>
        <dt>scale</dt>
        <dd>{midScale}</dd>
        <dt>lows</dt>
        <dd>{lows}</dd>
        <dt>mids</dt>
        <dd>{mids}</dd>
        <dt>highs</dt>
        <dd>{highs}</dd>
        <dt>hover frequency</dt>
        <dd>{hoverFreq}</dd>
      </dl>
    </>
  );
};

function drawFFTSlice(
  analyzer: Mp3Analyzer,
  canvas: HTMLCanvasElement,
  min?: number,
  max?: number
) {
  min = min || 0;
  max = max || 22000;
  const ctx = canvas.getContext("2d")!;
  const fftData = analyzer.getFFTValues();
  const numBuckets = 100;
  const bins = analyzer.getEnergyBins(numBuckets, min, max, fftData);
  const indexOfMin = analyzer.getIndexOfFrequency(min);
  const indexOfMax = analyzer.getIndexOfFrequency(max);
  const indexStep = (indexOfMax - indexOfMin) / numBuckets;
  let approxIndex = indexOfMin;
  for (let i = 1; i < bins.length; i++) {
    ctx.beginPath();

    ctx.strokeStyle = "white";
    const frequency = analyzer.getFrequencyOfIndex(approxIndex);

    if (
      Util.isNumberInRange(frequency, [
        Mp3Analyzer.getLowRange().low,
        Mp3Analyzer.getLowRange().high,
      ])
    ) {
      ctx.strokeStyle = "red";
    } else if (
      Util.isNumberInRange(frequency, [
        Mp3Analyzer.getMidRange().low,
        Mp3Analyzer.getMidRange().high,
      ])
    ) {
      ctx.strokeStyle = "blue";
    } else if (
      Util.isNumberInRange(frequency, [
        Mp3Analyzer.getHighRange().low,
        Mp3Analyzer.getHighRange().high,
      ])
    ) {
      ctx.strokeStyle = "green";
    }

    ctx.lineWidth = 5;

    const x1 = Util.mapRange(i - 1, 0, bins.length, 0, canvas.width);
    const y1 = Util.mapRange(bins[i - 1], 0, 100, canvas.height, 0);
    const x2 = Util.mapRange(i, 0, bins.length, 0, canvas.width);
    const y2 = Util.mapRange(bins[i], 0, 100, canvas.height, 0);

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    approxIndex += indexStep;
  }
}

const Circle = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 100px;
  background-color: red;
  outline: 1px solid yellow;
  outline-offset: 10px;
`;

export default IWBPWCF;
