import MDXBlogPost from "@/components/MDXBlogPosts/MDXBlogPost";
import { GetBlogPosts } from "@/scripts/blogPosts";
import { notFound } from "next/navigation";
import LabelsList from "./LabelsList";
import CodPointer from "@/components/CodPointer/CodPointer";

// export const dynamicParams = false;
export async function generateStaticParams() {
  const posts = await GetBlogPosts();

  return posts.map((bp) => ({
    year: bp.date.getFullYear().toString(),
    slug: bp.slug,
  }));
}

const Page = async ({ params }: { params: { year: string; slug: string } }) => {
  const blogPost = (await GetBlogPosts()).find(
    (item) => item.slug == params.slug
  );
  if (blogPost == undefined) {
    notFound();
  }
  return (
    <>
      {blogPost.labels.includes("cod") && <CodPointer />}

      <MDXBlogPost blogPost={blogPost} />
    </>
  );
};

export default Page;
