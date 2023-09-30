import type { CollectionEntry } from "astro:content";
import Fuse from "fuse.js";
import {
  Show,
  createSignal,
  createMemo,
  createEffect,
  onMount,
} from "solid-js";
import { PostListItem } from "./PostListItem";

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
      <label
        for="default-search"
        class="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Search
      </label>
      <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            aria-hidden="true"
            class="h-5 w-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 pl-10 text-sm text-gray-900 focus:border-primary-500 focus:outline-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
          placeholder="Search blog posts..."
          required
          id="search"
          onInput={(e) => setQuery(e.target.value)}
          value={query()}
        />
      </div>

      <Show when={posts().length > 0}>
        <ul class="grid list-none gap-6 p-0">
          {posts().map((post, index) => (
            <li class="p-0 animate-stagger" style={{ 
              '--animation-order': index + 1
            }}>
              <PostListItem post={post} />
            </li>
          ))}
        </ul>
      </Show>
    </div>
  );
}
