"use client";
import { BlogPostData } from "@/lib/blogPosts";
import * as JsSearch from "js-search";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import styles from "./blogPosts.module.css";
import { useInView } from "react-intersection-observer";

interface Props {
  children: { data: BlogPostData; node: ReactNode }[];
}

interface BlogPostWrapperProps {
  children: ReactNode;
}

const BlogPostList = ({ children }: Props) => {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search");
  const tagOnlyParam = searchParams.get("tagsOnly");

  let search = new JsSearch.Search(["data", "title"]);
  console.log("tag param is " + tagOnlyParam);
  search.addIndex(["data", "labels"]);
  if (tagOnlyParam != "true") {
    search.addIndex(["data", "content"]);
  }

  search.addDocuments(children);
  let results = children;
  if (searchParam) {
    results = search.search(searchParam) as {
      data: BlogPostData;
      node: ReactNode;
    }[];
  }

  return (
    <>
      {results.map(({ data, node }) => (
        <div key={data.title} className={styles.blogPost}>
          {node}
        </div>
      ))}
    </>
  );
};

export default BlogPostList;
