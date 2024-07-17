"use client";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const k_script: [string, number][] = [
  ["I'm fuckin 21 years old today", 2.8],
  ["I got these fucking sam amuls", 4.88],
  ["eh", 6.84],
  ["sam adams", 7.35],
  ["fuckin", 7.87],
  ["uhhhh", 8.37],
  ["octoberfest shit", 8.9],
  ["we're about to get fucking ignorant", 10.5],
  ["I do this shit for my friends", 11.85],
  ["I do this shit for my fuckin family", 13.0],
  ["lets fuckin go", 14.4],
  ["", 16],
];

const SamAdamsOctoberFest = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordList, setWordList] = useState<string[]>([]);
  useEffect(() => {
    const onVideoUpdate = () => {
      const currentTime = videoRef.current!.currentTime;
      const validWords = k_script
        .filter((line) => currentTime > line[1])
        .map((item) => item[0]);
      let text = validWords.length > 0 ? validWords[validWords.length - 1] : "";
      if (validWords.length != wordList.length) {
        setWordList(validWords);
      }

      textRef.current!.textContent = text;
    };

    videoRef.current!.addEventListener("timeupdate", onVideoUpdate);

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", onVideoUpdate);
      }
    };
  }, [videoRef.current, wordList]);
  useEffect(() => {
    if (wordList.length > 0) {
      containerRef.current!.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    }
  }, [wordList]);
  return (
    <>
      <StyledSamAdamsOctoberFest ref={containerRef}>
        <h1 ref={textRef}></h1>
        <video
          controls
          webkit-playsinline="true"
          playsInline
          ref={videoRef}
          src="/samAdams.mp4#t=0.1"
        ></video>
        <>
          {wordList.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
        </>
      </StyledSamAdamsOctoberFest>
    </>
  );
};

const StyledSamAdamsOctoberFest = styled.div`
  position: relative;

  h1 {
    position: absolute;
    left: 10px;
    top: 10px;
    color: white;
    text-shadow: black 1px 0 10px;
  }
`;

export default SamAdamsOctoberFest;
