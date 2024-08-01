import { Suspense } from "react";
import Search from "./Search";
import { GetTags } from "@/lib/blogPosts/Strapi";
import { GetBlogPosts } from "@/lib/blogPosts";

const SearchBar = async () => {
  const suggestions = await GetTags();
  console.log(suggestions);
  return (
    <>
      <Suspense>
        <Search suggestedValues={suggestions} />
      </Suspense>
    </>
  );
};

export default SearchBar;
