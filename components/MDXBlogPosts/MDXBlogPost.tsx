import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeStarryNight from "rehype-starry-night";
import ForestsVisualizerComponent from "../ForestsVisualizer/ForestsVisualizerComponent";

import { BlogPostData, getYearSlugLinkFromBlogPost } from "@/scripts/blogPosts";
import Link from "next/link";
import { visit } from "unist-util-visit";
import SamAdamsOctoberFest from "../SamAdamsOctoberFest";
import CodPointer from "../CodPointer/CodPointer";
import LabelsList from "@/app/[year]/[slug]/LabelsList";

interface Props {
  blogPost: BlogPostData;
}

const cmsMediaUrl =
  "https://github.com/simonlhopkins/club-eric-cms/raw/main/blogPosts/media/";
const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];

function rehypeChangeImgSrc() {
  return (tree: any) => {
    visit(tree, "element", (node) => {
      if (node.properties.src) {
        const src = node.properties.src;
        const cmsUrl = cmsMediaUrl + src;

        if (node.tagName === "img") {
          if (videoExtensions.some((ext) => src.endsWith(ext))) {
            node.tagName = "video";
            node.properties.src = cmsUrl + "#t=0.1";
            node.properties.type = "video/mp4";
            node.properties.alt = src;
            delete node.properties.alt;
          } else {
            node.properties.src = cmsUrl;
            node.properties.alt = cmsUrl;
          }
        }
      }
    });
  };
}

const components = {
  ForestsVisualizerComponent,
  SamAdamsOctoberFest,
  CodPointer,
};
const mdxOptions = {
  remarkPlugins: [],
  rehypePlugins: [rehypeStarryNight, rehypeChangeImgSrc],
  development: process.env.NODE_ENV === "development",
};
const MDXBlogPost = async ({ blogPost }: Props) => {
  return (
    <div>
      <Link href={getYearSlugLinkFromBlogPost(blogPost)}>
        <h1>{blogPost.title}</h1>
      </Link>
      <LabelsList labels={blogPost.labels} />
      <MDXRemote
        source={blogPost.content}
        options={{
          mdxOptions: mdxOptions,
        }}
        components={components}
      />
    </div>
  );
};

export default MDXBlogPost;
