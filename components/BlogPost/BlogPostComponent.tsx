import StrapiBlogPost from "@/components/BlogPost/StrapiBlogPost";
import { BlogPostData } from "@/lib/blogPosts";
import React from "react";
import MDXBlogPost from "./MDXBlogPost";

interface Props {
  blogPost: BlogPostData;
}
const BlogPostComponent = ({ blogPost }: Props) => {
  return (
    <>
      <StrapiBlogPost blogPostData={blogPost} />
      {/* <MDXBlogPost blogPost={blogPost} /> */}
    </>
  );
};

export default BlogPostComponent;
