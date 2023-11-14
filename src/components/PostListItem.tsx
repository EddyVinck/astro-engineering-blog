import type { CollectionEntry } from "astro:content";

export const PostListItem = ({ post }: { post: CollectionEntry<"blog"> }) => {
  const { data, slug } = post;
  const { title, description, pubDate, authors, topics } = data;
  const topicsList = topics.length > 0 ? topics.join(", ") : "uncategorized";
  return (
    <div class="post flex flex-col">
      <h2 class="mb-0.5 mt-0 text-xl">
        <a
          class="text-link no-underline hover:underline"
          href={`/blog/${slug}/`}
        >
          {title}
        </a>
      </h2>
      <p class="mb-2 text-sm">{description}</p>
      <div class="info sm:dot-separated flex flex-col flex-wrap gap-1 text-xs text-gray-600 opacity-80 dark:text-white/50 dark:opacity-95 sm:flex-row sm:items-center sm:gap-0">
        <p class="m-0">Written by {authors.join(" & ")}</p>
        <span class="flex">
          <div class="sm:sr-only">Date:&nbsp;</div>
          <time class="inline" datetime={pubDate.toISOString()}>
            {pubDate.toLocaleDateString("en-us", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </span>
        <p class="m-0">Topics: {topicsList}</p>
      </div>
    </div>
  );
};
