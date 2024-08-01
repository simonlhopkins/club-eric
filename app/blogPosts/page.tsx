import { GetBlogPosts } from "@/lib/blogPosts";
import { Suspense } from "react";
import BlogPostList from "./BlogPostList";
import BlogPostComponent from "@/components/BlogPost/BlogPostComponent";

const getSortedPosts = async () => {
  const bp = (await GetBlogPosts()).sort((a, b) => {
    return b.date.getTime() - a.date.getTime();
  });
  return bp;
};

const Page = async () => {
  // const { data, error, isLoading } = useSWR("getSortedPosts", getSortedPosts);

  const posts = await getSortedPosts();
  // if (isLoading) {
  //   return <p>loading...</p>;
  // }
  const contentMap = posts.map((bp) => ({
    data: bp,
    node: <BlogPostComponent blogPost={bp} />,
  }));
  return (
    <>
      <Suspense>
        <BlogPostList>{contentMap}</BlogPostList>
      </Suspense>
    </>
  );
};

export default Page;
