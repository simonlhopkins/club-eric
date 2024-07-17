"use client";
import Link from "next/link";
import { ListNode } from "./BlogArchive";
import styles from "./BlogArchive.module.css";

import { useEffect, useState } from "react";

interface Props {
  listNode: ListNode;
  initialShowChildren: boolean;
}

const ListDropDown = ({ listNode, initialShowChildren }: Props) => {
  const [showChildren, setShowChildren] = useState(initialShowChildren);

  //this can make it so the dom elements will always exist which could be nice for animations or something

  useEffect(() => {
    //if it's prop is set to false, update it's show children variable to false which will propogate down to it's children
    if (!initialShowChildren) {
      setShowChildren(false);
    }
  }, [initialShowChildren]);
  const isLeaf = listNode.children.length == 0;

  const getSumOfChildren = (current: ListNode): number => {
    if (current.children.length == 0) {
      return 1;
    }
    let sum = 0;
    for (let i = 0; i < current.children.length; i++) {
      sum += getSumOfChildren(current.children[i]);
    }
    return sum;
  };

  const recursiveNumChildren = getSumOfChildren(listNode);

  return (
    <li>
      <p
        className={styles.title}
        onClick={() => {
          setShowChildren((prev) => !prev);
        }}
      >
        <>
          {!isLeaf && `${showChildren ? "▼" : "▶"}`}
          {listNode.link ? (
            <Link href={listNode.link}>{listNode.title}</Link>
          ) : (
            listNode.title
          )}
          {listNode.children.length > 0 && (
            <span
              className={styles.childCount}
            >{` (${recursiveNumChildren})`}</span>
          )}
        </>
      </p>

      <ul
        className={[
          showChildren ? styles.open : styles.closed,
          styles.list,
        ].join(" ")}
      >
        {listNode.children.map((child) => (
          <ListDropDown
            initialShowChildren={showChildren}
            key={child.title}
            listNode={child}
          />
        ))}
      </ul>
    </li>
  );
};

export default ListDropDown;
