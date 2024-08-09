import { GetBlogPosts, getYearSlugLinkFromBlogPost } from "@/lib/blogPosts";
import Link from "next/link";

// export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await GetBlogPosts();

  const years = Array.from(new Set(posts.map((p) => p.date.getFullYear())));
  return years.map((year) => ({
    year: year.toString(),
  }));
}

const Page = async ({ params }: { params: { year: string } }) => {
  const { year } = params;

  const blogPostsInYear = (await GetBlogPosts()).filter(
    (bp) => bp.date.getFullYear().toString() == year
  );
  return (
    <>
      <ul>
        {blogPostsInYear.map((bp) => (
          <li key={bp.slug}>
            <Link href={getYearSlugLinkFromBlogPost(bp)}>{bp.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Page;
