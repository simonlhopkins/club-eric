"use client";

import React, { ReactNode } from "react";
import { IwbpwcfProvider } from "./iwbpwcf/IwbpwcfContext";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <IwbpwcfProvider>{children}</IwbpwcfProvider>
    </>
  );
};

export default Providers;
