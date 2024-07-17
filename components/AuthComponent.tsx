"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

const AuthComponent = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <p>Access Denied</p>
        <button
          onClick={() => {
            signIn();
          }}
        >
          sign in
        </button>
      </>
    );
  }
  return (
    <>
      <h1>{session?.user?.name}</h1>
      <h1>{status}</h1>
      <img src={session?.user?.image as string}></img>
      <button
        onClick={() => {
          signOut();
        }}
      >
        log out
      </button>
    </>
  );
};

export default AuthComponent;
