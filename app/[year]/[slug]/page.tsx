import { GetBlogPosts } from "@/lib/blogPosts";
import { notFound } from "next/navigation";
import CodPointer from "@/components/CodPointer/CodPointer";
import BlogPostComponent from "@/components/BlogPost/BlogPostComponent";

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

      <BlogPostComponent blogPost={blogPost} />
    </>
  );
};

export default Page;
