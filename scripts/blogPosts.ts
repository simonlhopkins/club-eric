import axios from "axios";
import matter from "gray-matter";
import { cache } from "react";

const blogPostsPath = "./cms/blogPosts";

export interface BlogPostData {
  slug: string;
  title: string;
  date: Date;
  content: string;
  labels: string[];
}

async function fetchFromGithub() {
  const response = await fetch(
    `https://api.github.com/repos/simonlhopkins/club-eric-cms/contents/blogPosts`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 3600 },
    }
  );
  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }
  const data = await response.json();
  const ret = data
    .filter((item: any) => item.type == "file" && item.name.endsWith(".mdx"))
    .map((fileData: any) => {
      return fetch(
        `https://api.github.com/repos/simonlhopkins/club-eric-cms/contents/${fileData.path}`,
        {
          headers: {
            Accept: "application/vnd.github.raw+json",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
          next: { revalidate: 3600 },
        }
      )
        .then((response) => response.json())
        .then((data) => matter(data))
        .then((markdown) => ({
          slug: fileData.name.replace(/\.(md|mdx)$/, ""), //todo replace spaces and such in the slug
          title: markdown.data.title,
          date: markdown.data.date,
          labels: markdown.data.tags,
          content: markdown.content,
        }));
    });
  const fileContents = await Promise.all(ret);
  return fileContents;
}

export const GetBlogPosts = cache(async () => {
  const response = await fetchFromGithub()
    // .then((res) => res.json())
    .catch((err) => {
      console.log("error");
      console.log(err);
      return null;
    });
  if (response == null) {
    return [];
  }
  return response.map((rawData: any) => ({
    ...rawData,
    date: new Date(rawData.date),
  })) as BlogPostData[];
});

export function getYearSlugLinkFromBlogPost(bp: BlogPostData) {
  return `/${bp.date.getFullYear()}/${bp.slug}`;
}

// async function GetAllFilePaths() {
//   return await fs.readdir(blogPostsPath);
// }

// async function GetAllBlogIds() {
//   return (await GetAllFilePaths()).map((filename) =>
//     filename.replace(/\.(md|mdx)$/, "")
//   );
// }

// export async function GetAllBlogPostData() {
//   return (
//     await Promise.all((await GetAllBlogIds()).map((id) => GetBlogPostByID(id)))
//   ).sort((a, b) => {
//     return a.date.getTime() - b.date.getTime();
//   });
// }

// export async function GetBlogPostByID(id: string) {
//   const filePath = path.join(blogPostsPath, id + ".mdx");
//   const fileContent = await fs.readFile(filePath, "utf8");
//   const parsedContent = matter(fileContent);

//   // Combine the data with the id and contentHtml
//   return {
//     id: id,
//     title: parsedContent.data.title,
//     labels: parsedContent.data.labels,
//     date: parsedContent.data.date,
//     content: parsedContent.content,
//   } as BlogPostData;
// }
