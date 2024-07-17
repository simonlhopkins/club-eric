"use client";
import React, { useState } from "react";
import style from "./circle.module.css";

const GrowingCircle = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  // let isExpanded = false;
  return (
    <div>
      <div
        onClick={() => {
          setIsExpanded((prev) => !prev);
        }}
        className={style.circle + " " + (isExpanded ? style.expanded : "")}
      ></div>
    </div>
  );
};

export default GrowingCircle;
