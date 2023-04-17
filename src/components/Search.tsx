import type { CollectionEntry } from "astro:content";
import Fuse from "fuse.js";
import {
  Show,
  createSignal,
  createMemo,
  createEffect,
  onMount,
} from "solid-js";

const options = {
  keys: ["data.title", "data.description", "slug"],
  includeMatches: true,
  minMatchCharLength: 2,
  threshold: 0.5,
};

type Props = {
  searchList: CollectionEntry<"blog">[];
};

export default function Search({ searchList }: Props) {
  const fuse = new Fuse(searchList, options);

  const [query, setQuery] = createSignal("");

  const posts = createMemo(() => {
    return fuse
      .search(query())
      .map((result) => result.item)
      .slice(0, 5)
      .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
  });

  // initialize query from URL
  onMount(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const initialQuery = searchParams.get("q") || "";
      setQuery(initialQuery);
    }
  });

  // Update URL query parameter when the query changes
  createEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("q", query());
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({}, "", newUrl);
  });

  return (
    <div>
      <input onInput={(e) => setQuery(e.target.value)} value={query()} />
      <Show when={posts().length > 0}>
        <ul>
          {posts().map((post) => (
            <li>
              <a href={`/blog/${post.slug}`}>{post.data.title}</a>
              {post.data.description}
            </li>
          ))}
        </ul>
      </Show>
    </div>
  );
}
