import { type APIRoute } from "astro";
import {
  getPostReactionsById,
  incrementEmojiReactionCount,
  type PostReactionOption,
  type PostReactions,
} from "../../../lib/appwrite/appwrite.server";

export const prerender = false;

export const GET: APIRoute = async ({ params }): Promise<Response> => {
  const id = params.id;

  if (!import.meta.env.SECRET_APPWRITE_API_KEY) {
    return new Response(JSON.stringify({ error: "internal server error" }), {
      status: 500,
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      statusText: "Not found",
    });
  }

  let postReactions = null;

  postReactions = await getPostReactionsById(id);

  if (!postReactions) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  const postReactionData: PostReactions = {
    id: postReactions.id,
    hearts: postReactions.hearts,
    likes: postReactions.likes,
    parties: postReactions.parties,
    poops: postReactions.poops,
  };

  return new Response(JSON.stringify(postReactionData), {
    status: 200,
  });
};

export const POST: APIRoute = async ({ request, params }) => {
  const id = params.id;

  if (!import.meta.env.SECRET_APPWRITE_API_KEY) {
    return new Response(JSON.stringify({ error: "internal server error" }), {
      status: 500,
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      statusText: "Not found",
    });
  }

  if (request.headers.get("Content-Type") === "application/json") {
    const body = await request.json();
    const reactionType: PostReactionOption = body.type;

    try {
      const result = await incrementEmojiReactionCount(id, reactionType);
      if (!result) throw new Error();
      let newReactions: PostReactions = {
        id: result.id,
        likes: result.likes,
        hearts: result.hearts,
        parties: result.parties,
        poops: result.poops,
      };

      return new Response(JSON.stringify(newReactions), {
        status: 200,
      });
    } catch (error) {
      console.log(`🚨 err when reacting to ID "${id}"!`, error);
    }
  }
  return new Response(null, { status: 400 });
};
