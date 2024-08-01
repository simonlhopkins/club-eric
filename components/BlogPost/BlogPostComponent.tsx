import StrapiBlogPost from "@/components/BlogPost/StrapiBlogPost";
import { BlogPostData } from "@/lib/blogPosts";
import React from "react";

interface Props {
  blogPost: BlogPostData;
}
const BlogPostComponent = ({ blogPost }: Props) => {
  return (
    <>
      <StrapiBlogPost blogPostData={blogPost} />
    </>
  );
};

export default BlogPostComponent;
