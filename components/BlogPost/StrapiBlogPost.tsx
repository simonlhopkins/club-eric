import LabelsList from "@/app/[year]/[slug]/LabelsList";
import ForestsVisualizerComponent from "@/components/ForestsVisualizer/ForestsVisualizerComponent";
import { BlogPostData } from "@/lib/blogPosts";
import parse, {
  HTMLReactParserOptions,
  Text,
  Element,
} from "html-react-parser";
import React, { ReactNode } from "react";
import styles from "./strapiBlogPost.module.css";

interface ComponentPair {
  tag: string;
  component: React.JSX.Element;
}

export type ComponentMap = ComponentPair[];

interface Props {
  blogPostData: BlogPostData;
}
const componentMap: ComponentMap = [
  {
    tag: "ForestsVisualizer",
    component: <ForestsVisualizerComponent />,
  },
];
const StrapiBlogPost = ({ blogPostData }: Props) => {
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      for (const entry of componentMap) {
        if (domNode instanceof Element && domNode.tagName == "p") {
          if (
            domNode.children.length > 0 &&
            (domNode.children[0] as Text).data == `<${entry.tag}/>`
          ) {
            return entry.component;
          }
        }
      }

      if (domNode.type === "tag" && domNode.name === "figure") {
        const sourceElement: Element | undefined = domNode.children.find(
          (child) => (child as Element).name === "oembed"
        ) as Element;
        if (sourceElement) {
          return <YoutubeEmbed src={sourceElement.attribs.url} />;
        }
      }

      if (domNode.type === "tag" && domNode.name === "video") {
        const sourceElement: Element | undefined = domNode.children.find(
          (child) => (child as Element).name === "source"
        ) as Element;
        if (sourceElement) {
          return <CustomVideo src={sourceElement.attribs.src} />;
        }
      }
    },
  };
  return (
    <div>
      <h1>{blogPostData.title}</h1>
      <p>slug: {blogPostData.slug}</p>
      <p>date: {blogPostData.date.toLocaleDateString()}</p>
      <LabelsList labels={blogPostData.labels} />
      <div className="ck-content">{parse(blogPostData.content, options)}</div>
    </div>
  );
};

interface VideoProps {
  src: string;
}
const CustomVideo = ({ src }: VideoProps) => {
  return <video className={styles.video} controls src={src} />;
};
function convertYouTubeUrlToEmbed(url: string): string {
  const youtubeUrlPattern =
    /^(https:\/\/www\.youtube\.com)\/watch\?v=([a-zA-Z0-9_-]+)$/;

  const match = url.match(youtubeUrlPattern);
  if (match) {
    const baseUrl = match[1];
    const videoId = match[2];
    return `${baseUrl}/embed/${videoId}`;
  }

  throw new Error("Invalid YouTube URL");
}
const YoutubeEmbed = ({ src }: VideoProps) => {
  return (
    <iframe
      width="420"
      height="315"
      src={convertYouTubeUrlToEmbed(src)}
    ></iframe>
  );
};
export default StrapiBlogPost;
