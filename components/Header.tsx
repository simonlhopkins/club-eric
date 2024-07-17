import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header>
      <Link href="/">
        <img
          style={{ width: "100%" }}
          src="/placeholder/sophiesFloorBoardHeader.png"
        ></img>
      </Link>
    </header>
  );
};

export default Header;
