import React, { Suspense, useEffect, useState } from "react";
import SpotifyLoginPage from "./SpotifyLoginPage";

const Page = () => {
  return (
    <Suspense fallback={null}>
      <SpotifyLoginPage />
    </Suspense>
  );
};

export default Page;
