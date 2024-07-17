"use client";

import { useEffect, useRef, useState } from "react";
import { Util } from "../Util";
import ForestsAnalyzer from "./ForestsAnalyzer";
import ForestsCanvas from "./ForestsCanvas";
import styles from "./forestsVisualizer.module.css";

const k_canvasWidth = 500;
const k_canvasHeight = 300;

function plotArray(
  ctx: CanvasRenderingContext2D,
  color: string,
  arr: number[],
  yMin: number,
  yMax: number
) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  for (let i = 1; i < arr.length; i++) {
    const x1 = Util.mapRange(i - 1, 0, arr.length, 0, k_canvasWidth);
    const y1 = Util.mapRange(arr[i - 1], yMin, yMax, k_canvasHeight, 0);

    const x2 = Util.mapRange(i, 0, arr.length, 0, k_canvasWidth);
    const y2 = Util.mapRange(arr[i], yMin, yMax, k_canvasHeight, 0);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

//credit this
//https://ciphrd.com/2019/09/01/audio-analysis-for-advanced-music-visualization-pt-1/

const ForestsVisualizerComponent = () => {
  const analyzerRef = useRef<ForestsAnalyzer | null>(null);
  const forestsCanvasRef = useRef<ForestsCanvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(true);

  function getAnalyzer(): ForestsAnalyzer {
    if (analyzerRef.current !== null) {
      return analyzerRef.current!;
    }
    console.log("assigning analyzer");
    const analyzer = new ForestsAnalyzer();

    analyzerRef.current = analyzer;
    return analyzer;
  }

  useEffect(() => {
    if (isMuted) {
      getAnalyzer().mute();
    } else {
      getAnalyzer().unmute();
    }
  }, [isMuted]);

  useEffect(() => {
    console.log(isPaused);
    if (isPaused) {
      getAnalyzer().pause();
      forestsCanvasRef.current?.pause();
    } else {
      getAnalyzer().resume();
      forestsCanvasRef.current?.play();
    }
    const update = () => {
      requestAnimationFrame(() => {
        forestsCanvasRef.current?.draw();
      });
    };
    let intervalID = null;
    if (!isPaused) {
      intervalID = setInterval(update, (1 / 60) * 1000);
    }

    return () => {
      if (intervalID) {
        clearInterval(intervalID);
      }
    };
  }, [isPaused]);

  useEffect(() => {
    getAnalyzer().init();
    if (forestsCanvasRef.current === null) {
      forestsCanvasRef.current = new ForestsCanvas(
        getAnalyzer(),
        canvasRef.current!
      );
    }

    return () => {
      getAnalyzer().cleanup();
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <button
        onClick={() => {
          console.log("click");
          setIsPaused((prev) => !prev);
        }}
      >
        {isPaused ? "resume" : "pause"}
      </button>

      <button
        onClick={() => {
          setIsMuted((prev) => !prev);
        }}
      >
        {isMuted ? "unmute" : "mute"}
      </button>
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        width={1024}
        height={1024}
      ></canvas>
    </div>
  );
};

export default ForestsVisualizerComponent;
