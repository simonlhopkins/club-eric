// components/SearchBar.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search");
  const tagOnlyParam = searchParams.get("tagsOnly");
  const [search, setSearch] = useState("");
  const [tagsOnly, setTagsOnly] = useState(false);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  useEffect(() => {
    setSearch(searchParam || "");
  }, [searchParam]);
  useEffect(() => {
    setTagsOnly(tagOnlyParam == "true");
  }, [tagOnlyParam]);
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) {
      const searchParams = new URLSearchParams([
        ["search", search.trim()],
        ["tagsOnly", tagsOnly ? "true" : "false"],
      ]);
      router.push(`/blogPosts?${searchParams}`);
    } else {
      router.push("/blogPosts");
    }
  };

  return (
    <form onSubmit={handleSearchSubmit}>
      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder={"Search..."}
      />
      <label>
        <input
          type="checkbox"
          checked={tagsOnly}
          onChange={(event) => {
            setTagsOnly(event.target.checked);
          }}
        />
        Tags Only?
      </label>
      <button type="submit">Search</button>
    </form>
  );
};

const SearchBar = () => {
  return (
    <Suspense>
      <Search />
    </Suspense>
  );
};

export default SearchBar;
