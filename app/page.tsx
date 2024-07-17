import { GetBlogPosts } from "@/scripts/blogPosts";
import LatestBlogPost from "./LatestBlogPost";
import CodPointer from "@/components/CodPointer/CodPointer";

export default async function Home() {
  const blogPosts = (await GetBlogPosts()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  return (
    <>
      {blogPosts.length > 0 && <LatestBlogPost blogPost={blogPosts[0]} />}
      <h1>Club Eric</h1>
      <img src="/ericLogos/EricGlitter.gif" />
      <img alt="philbin corp image" src="/philbinLogo.png"></img>
    </>
  );
}
