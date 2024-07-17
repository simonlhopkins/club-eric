import axios from "axios";
import { promises as fs } from "fs";
import matter from "gray-matter";
const BLOG_FOLDER = process.cwd() + "/cms/blogPosts";

//in the future this can fetch from an api

export async function GET() {
  const response = await axios.get(
    `https://api.github.com/repos/simonlhopkins/club-eric-cms/contents/blogPosts`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  const ret = response.data
    .filter((item: any) => item.type == "file" && item.name.endsWith(".mdx"))
    .map((fileData: any) => {
      return axios
        .get(
          `https://api.github.com/repos/simonlhopkins/club-eric-cms/contents/${fileData.path}`,
          {
            headers: {
              Accept: "application/vnd.github.raw+json",
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        )
        .then((response) => matter(response.data))
        .then((markdown) => ({
          slug: fileData.name.replace(/\.(md|mdx)$/, ""), //todo replace spaces and such in the slug
          title: markdown.data.title,
          date: markdown.data.date,
          labels: markdown.data.tags,
          content: markdown.content,
        }));
    });
  const fileContents = await Promise.all(ret);
  return Response.json(fileContents);

  //old reading locally code
  const files = (await fs.readdir(BLOG_FOLDER)).filter((file) =>
    file.endsWith(".mdx")
  );
  const blogPosts = await Promise.all(
    files.map(async (filename) => {
      const fileContent = await fs.readFile(
        `${BLOG_FOLDER}/${filename}`,
        "utf8"
      );
      const markdown = matter(fileContent);
      return {
        slug: filename.replace(/\.(md|mdx)$/, ""), //todo replace spaces and such in the slug
        title: markdown.data.title,
        date: markdown.data.date,
        labels: markdown.data.tags,
        content: markdown.content,
      };
    })
  );
  return Response.json(blogPosts);
}
