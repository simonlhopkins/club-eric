"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./codPointer.module.css";

const k_numFrames = 15;
const k_frameRate = 24;
interface Point {
  x: number;
  y: number;
}
class CodGifPlayer {
  isLoaded: boolean = false;
  frames: string[] = [];
  img: HTMLImageElement | null = null;
  intervalID: number | null = null;
  positon: Point = { x: 0, y: 0 };
  constructor() {
    this.frames = Array(k_numFrames)
      .fill("")
      .map((_, i) => `/codPointer/codPointer${i}.png`);
    this.load().then(() => {
      this.isLoaded = true;
    });
  }
  setImage(img: HTMLImageElement) {
    this.img = img;
  }
  setPos(point: Point) {
    if (this.img) {
      this.img.style.left = `${point.x - this.img.width * 0.28}px`;
      this.img.style.top = `${point.y - this.img.height * 0.51}px`;
    }
  }
  play() {
    this.stop();
    let i = 0;
    if (this.img == null) {
      console.error("can't play, image does not exist");
      return;
    }
    const img = this.img!;
    this.intervalID = window.setInterval(() => {
      if (i >= this.frames.length) {
        img.src = this.frames[0];
        this.stop();
        return;
      }
      img.src = this.frames[i];
      i++;
    }, (1 / k_frameRate) * 1000);
  }
  stop() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
  }
  load() {
    let promises = this.frames.map(
      (fileName) =>
        new Promise<string>((res, rej) => {
          const img = new Image();
          img.onload = () => {
            res(img.src);
          };
          img.onerror = () => {
            rej();
          };
          img.src = fileName;
        })
    );
    return Promise.all(promises);
  }
}

const CodPointer = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  const playerRef = useRef<CodGifPlayer>();
  const getPlayer = () => {
    if (playerRef.current == null) {
      playerRef.current = new CodGifPlayer();
    }
    return playerRef.current;
  };
  useEffect(() => {
    getPlayer().setImage(imgRef.current!);
    const onMove = (event: MouseEvent) => {
      getPlayer().setPos({
        x: event.pageX,
        y: event.pageY,
      });
    };
    const onClick = () => {
      getPlayer().play();
    };
    addEventListener("mousemove", onMove);
    addEventListener("click", onClick);
    return () => {
      getPlayer().stop();
      removeEventListener("mousemove", onMove);
      removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <img
        className={styles.image}
        ref={imgRef}
        src="/codPointer/codPointer0.png"
      ></img>
    </>
  );
};

export default CodPointer;
