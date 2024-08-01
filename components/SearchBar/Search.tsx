// components/SearchBar.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import style from "./searchbar.module.scss";
interface Props {
  suggestedValues: string[];
}
const Search = ({ suggestedValues }: Props) => {
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
  }, [tagOnlyParam, searchParam]);
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
    <form onSubmit={handleSearchSubmit} className={style.searchbar}>
      <input
        className={style.input}
        type="search"
        autoComplete="on"
        value={search}
        list="tags"
        onChange={handleSearchChange}
        placeholder={"Search..."}
      />
      <datalist id="tags">
        {suggestedValues.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </datalist>
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

export default Search;
