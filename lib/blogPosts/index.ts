import axios from "axios";
import matter from "gray-matter";
import { cache } from "react";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { GetStrapiBlogPosts } from "./Strapi";

const blogPostsPath = "./cms/blogPosts";

export interface BlogPostData {
  slug: string;
  title: string;
  date: Date;
  content: string;
  labels: string[];
}

const REGION = "us-west-2"; // e.g., "us-east-1"
const BUCKET_NAME = "club-eric-cms";

export const S3_BUCKET_URL =
  "https://club-eric-cms.s3.us-west-2.amazonaws.com/blogPosts/";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  region: REGION,
});

async function listMdxFiles(bucketName: string): Promise<string[]> {
  const command = new ListObjectsV2Command({ Bucket: bucketName });
  const response = await s3Client.send(command);
  if (!response.Contents) {
    throw new Error("No contents found in the bucket.");
  }

  return response.Contents.filter((item) => item.Key?.endsWith(".mdx")).map(
    (item) => item.Key as string
  );
}

async function fetchMdxFile(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch MDX file: ${response.statusText}`);
  }
  return await response.text();
}

async function fetchFromS3(bucketName: string): Promise<BlogPostData[]> {
  try {
    const mdxFiles = await listMdxFiles(bucketName);
    console.log(`Found ${mdxFiles.length} MDX files.`);

    const fetchPromises = mdxFiles.map(async (fileKey) => {
      const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
      const fileName = fileKey.split("/").pop() || null;
      if (fileName == null) {
        throw new Error(
          `Error getting the file name from this path ${fileKey}`
        );
      }
      return await fetchMdxFile(fileUrl)
        .then((rawData) => matter(rawData))
        .then((markdown) => ({
          slug: encodeURI(
            fileName.replace(/\.(md|mdx)$/, "").replace(/\s+/g, "")
          ), //todo replace spaces and such in the slug
          title: markdown.data.title,
          date: markdown.data.date,
          labels: markdown.data.tags,
          content: markdown.content,
        }));
    });

    const contents = await Promise.all(fetchPromises);
    return contents;
  } catch (error) {
    console.error("Error fetching MDX files:", error);
    throw error;
  }
}

export const GetBlogPosts: () => Promise<BlogPostData[]> = cache(async () => {
  // const response = await fetchFromS3(BUCKET_NAME).catch((err) => {
  //   console.log("error");
  //   console.log(err);
  //   return null;
  // });
  // if (response == null) {
  //   return [];
  // }
  // return response.map((rawData: any) => ({
  //   ...rawData,
  //   date: new Date(rawData.date),
  // })) as BlogPostData[];

  const strapiPosts = await GetStrapiBlogPosts();
  const blogPosts: BlogPostData[] = strapiPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: new Date(post.publishedAt),
    content: post.content,
    labels: post.tags.data.map((item) => item.attributes.name),
  }));
  return blogPosts;
});

export function getYearSlugLinkFromBlogPost(bp: BlogPostData) {
  return `/${bp.date.getFullYear()}/${bp.slug}`;
}

//Legacy

// async function fetchFromGithub() {
//   const response = await fetch(
//     `https://api.github.com/repos/simonlhopkins/club-eric-cms/contents/blogPosts`,
//     {
//       headers: {
//         Accept: "application/vnd.github+json",
//         Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
//         "X-GitHub-Api-Version": "2022-11-28",
//       },
//       next: { revalidate: 3600 },
//     }
//   );
//   if (!response.ok) {
//     throw new Error(`GitHub API responded with ${response.status}`);
//   }
//   const data = await response.json();
//   const ret = data
//     .filter((item: any) => item.type == "file" && item.name.endsWith(".mdx"))
//     .map((fileData: any) => {
//       return fetch(
//         `https://api.github.com/repos/simonlhopkins/club-eric-cms/contents/${fileData.path}`,
//         {
//           headers: {
//             Accept: "application/vnd.github.raw+json",
//             Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
//             "X-GitHub-Api-Version": "2022-11-28",
//           },
//           next: { revalidate: 3600 },
//         }
//       )
//         .then(async (response) => await response.text())
//         .then((data) => matter(data))
//         .then((markdown) => ({
//           slug: encodeURI(
//             fileData.name.replace(/\.(md|mdx)$/, "").replace(/\s+/g, "")
//           ), //todo replace spaces and such in the slug
//           title: markdown.data.title,
//           date: markdown.data.date,
//           labels: markdown.data.tags,
//           content: markdown.content,
//         }));
//     });
//   const fileContents = await Promise.all(ret);
//   console.log(fileContents.map((i) => i.slug));
//   return fileContents;
// }

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
