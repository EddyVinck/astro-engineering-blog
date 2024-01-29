import { createSignal, onMount } from "solid-js";
import type {
  PostReactionOption,
  PostReactions,
} from "../../lib/appwrite/appwrite.server";

type Props = {
  articleId: string;
  initialEmojiReactions: PostReactions;
};

/**
 * This component assumes that it is only rendered when an Appwrite API key has been added
 */
export const EmojiReactionsButtons = ({
  articleId,
  initialEmojiReactions,
}: Props) => {
  const [buttonsDisabled, setButtonsDisabled] = createSignal(false);
  const [emojiReactions, setEmojiReactions] = createSignal<PostReactions>(
    initialEmojiReactions
  );

  onMount(async function getCurrentVotes() {
    const response = await fetch(`/api/post-reactions/${articleId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return;
    const data = (await response.json()) as PostReactions;
    setEmojiReactions(data);
  });

  async function handleVote(type: PostReactionOption) {
    if (!articleId || buttonsDisabled()) return;

    const response = await fetch(`/api/post-reactions/${articleId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: type,
      }),
    });
    if (!response.ok) {
      if (response.status === 429) {
        setButtonsDisabled(true);
        setTimeout(() => {
          setButtonsDisabled(false);
        }, 10000);
      }
      return;
    }
    const data = (await response.json()) as PostReactions;
    setEmojiReactions(data);
  }

  return (
    <>
      {initialEmojiReactions !== null && (
        <aside>
          <p class="text-center text-lg italic">Rate this article</p>
          <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <button
              onClick={() => handleVote("likes")}
              class="rounded-lg bg-primary-500 p-2 text-center text-lg transition hover:bg-primary-600 active:scale-105 disabled:bg-slate-400 disabled:hover:bg-slate-500"
            >
              <span class="not-sr-only">👍</span>
              <span class="sr-only">likes: </span>
              <span id="likes-counter" class="ml-2 text-primary-foreground">
                {emojiReactions().likes}
              </span>
            </button>

            <button
              onClick={() => handleVote("hearts")}
              class="rounded-lg bg-primary-500 p-2 text-center text-lg transition hover:bg-primary-600 active:scale-105 disabled:bg-slate-400 disabled:hover:bg-slate-500"
            >
              <span class="not-sr-only">❤️</span>
              <span class="sr-only">hearts: </span>
              <span id="hearts-counter" class="ml-2 text-primary-foreground">
                {emojiReactions().hearts}
              </span>
            </button>

            <button
              onClick={() => handleVote("parties")}
              class="rounded-lg bg-primary-500 p-2 text-center text-lg transition hover:bg-primary-600 active:scale-105 disabled:bg-slate-400 disabled:hover:bg-slate-500"
            >
              <span class="not-sr-only">🎉</span>
              <span class="sr-only">parties: </span>
              <span id="parties-counter" class="ml-2 text-primary-foreground">
                {emojiReactions().parties}
              </span>
            </button>

            <button
              onClick={() => handleVote("poops")}
              class="rounded-lg bg-primary-500 p-2 text-center text-lg transition hover:bg-primary-600 active:scale-105 disabled:bg-slate-400 disabled:hover:bg-slate-500"
            >
              <span class="not-sr-only">💩</span>
              <span class="sr-only">poops: </span>
              <span id="poops-counter" class="ml-2 text-primary-foreground">
                {emojiReactions().poops}
              </span>
            </button>
          </div>
          <p class="text-center text-xs italic">
            Checkout the blog post{" "}
            <a href="/blog-ranking" class="text-link">
              ranking page
            </a>
          </p>
        </aside>
      )}
    </>
  );
};
