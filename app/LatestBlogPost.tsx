import { BlogPostData, getYearSlugLinkFromBlogPost } from "@/scripts/blogPosts";
import Link from "next/link";

interface Props {
  blogPost: BlogPostData;
}
const LatestBlogPost = ({ blogPost }: Props) => {
  return (
    <>
      <p>
        Check out the latest blog post {`"${blogPost.title}" `}
        <Link href={getYearSlugLinkFromBlogPost(blogPost)}>here</Link>
      </p>
    </>
  );
};

export default LatestBlogPost;
