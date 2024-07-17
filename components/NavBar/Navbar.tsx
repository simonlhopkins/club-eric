"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import styles from "./navbar.module.scss";
import BlogArchive from "../BlogArchive/BlogArchive";

interface RouteEntry {
  link: string;
  title: string;
}

interface Props {
  archive: ReactNode;
}
const NavBar = ({ archive }: Props) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const routes: RouteEntry[] = [
    { link: "/", title: "home" },
    { link: "/blogPosts", title: "blog posts" },
  ];
  useEffect(() => {
    setIsOpen(false); // When the dynamic route change reset the state
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("noscroll", isOpen);
  }, [isOpen]);
  return (
    <nav className={["navbar", styles.navbar].join(" ")}>
      <div
        onClick={() => {
          setIsOpen(true);
        }}
        className={styles.icon}
      />
      <div
        className={[isOpen ? styles.open : "", styles.navListWrapper].join(" ")}
      >
        <img
          src="/closeButton.gif"
          onClick={() => {
            setIsOpen(false);
          }}
          className={styles.closeButton}
        />
        <ul className={styles.navList}>
          {routes.map(({ link, title }) => (
            <li key={link} className={styles.navItem}>
              <Link href={link} className={pathname == link ? "active" : ""}>
                {title}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.navArchive}>{archive}</div>
      </div>
    </nav>
  );
};

export default NavBar;
