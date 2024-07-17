//Blog archive dropdown like on sophies floorboard
import {
  BlogPostData,
  GetBlogPosts,
  getYearSlugLinkFromBlogPost,
} from "@/scripts/blogPosts";
import styles from "./BlogArchive.module.css";
import ListDropDown from "./ListDropDown";
export interface ListNode {
  title: string;
  children: ListNode[];
  link?: string;
}

import Util from "@/scripts/Util";

//I should make it so it only fetches the articles when it reaches it's lowest level maybe, maybe not
//or it fetches all of the articles when you open up a dropdown for the year

const BlogArchive = async () => {
  const blogPosts = await GetBlogPosts();

  const rootNode: ListNode = { title: "root", children: [] };
  const placeNode = (
    currentNode: ListNode,
    arr: string[],
    bp: BlogPostData
  ) => {
    if (arr.length == 0) {
      currentNode.link = getYearSlugLinkFromBlogPost(bp);
      return;
    }
    const childToPlace = arr.shift()!;
    const nextNode = currentNode.children.find(
      (node) => node.title == childToPlace
    );
    if (nextNode) {
      placeNode(nextNode, arr, bp);
    } else {
      const newNode = {
        title: childToPlace,
        children: [],
      };
      currentNode.children.push(newNode);
      placeNode(newNode, arr, bp);
    }
  };
  for (let i = 0; i < blogPosts.length; i++) {
    const path = [
      blogPosts[i].date.getFullYear().toString(),
      Util.getMonthName(blogPosts[i].date.getMonth() + 1),
      blogPosts[i].title,
    ];
    placeNode(rootNode, path, blogPosts[i]);
  }

  return (
    <div>
      <h4>Blog Archive</h4>
      <ul className={styles.list}>
        {rootNode.children.map((node) => (
          <ListDropDown
            initialShowChildren={false}
            key={node.title}
            listNode={node}
          />
        ))}
      </ul>
    </div>
  );
};

export default BlogArchive;
