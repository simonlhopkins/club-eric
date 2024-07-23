"use client";

import React, { useEffect } from "react";

const ShopifyButton = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("src", "/ShopifyButton.js");

    document.head.appendChild(script);
    return () => {
      console.log("remove");
      document.head.removeChild(script);
    };
  }, []);
  return (
    <>
      <div id="product-component-1721432274978"></div>
    </>
  );
};

export default ShopifyButton;
