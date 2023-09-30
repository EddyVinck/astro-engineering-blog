import type { CollectionEntry } from "astro:content";

export const PostListItem = ({ post }: { post: CollectionEntry<"blog"> }) => {
  const { data, slug } = post;
  const { title, description, pubDate, authors, topics } = data;
  return (
    <div class="post flex flex-col gap-1">
      <h2 class="m-0 text-lg">
        <a
          class="text-link no-underline hover:underline"
          href={`/blog/${slug}/`}
        >
          {title}
        </a>
      </h2>
      <p class="text-sm italic">{description}</p>
      <div class="info dot-separated flex items-center text-sm text-gray-600 dark:text-white/50">
        <time datetime={pubDate.toISOString()}>
          {pubDate.toLocaleDateString("en-us", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
        <p class="m-0 text-sm italic">written by {authors.join(" & ")}</p>
        <p class="m-0 text-sm">topics: {topics.join(", ")}</p>
      </div>
    </div>
  );
};
