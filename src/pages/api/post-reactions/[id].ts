import { type APIRoute } from "astro";
import {
  getPostReactionsById,
  incrementEmojiReactionCount,
  type PostReactionOption,
  type PostReactions,
} from "../../../lib/appwrite/appwrite.server";
import rateLimit, { type RateLimitHeaders } from "../../../lib/ratelimit";

export const prerender = false;

const Getlimiter = rateLimit({
  interval: 10 * 1000, // 10 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

const Postlimiter = rateLimit({
  interval: 10 * 1000, // 10 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export const GET: APIRoute = async ({
  params,
  clientAddress,
}): Promise<Response> => {
  const id = params.id;
  const userIP = clientAddress;

  if (!import.meta.env.SECRET_APPWRITE_API_KEY) {
    return new Response(JSON.stringify({ error: "internal server error" }), {
      status: 500,
    });
  }

  let rateLimitHeaders: RateLimitHeaders | null = null;
  try {
    rateLimitHeaders = await Getlimiter.check(25, `GET-REACTIONS-${userIP}`);
  } catch (error: any) {
    if ("X-RateLimit-Limit" in error && "X-RateLimit-Remaining" in error) {
      const err = error as RateLimitHeaders;
      rateLimitHeaders = err;
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: new Headers({
          "X-RateLimit-Limit": err["X-RateLimit-Limit"].toString(),
          "X-RateLimit-Remaining": err["X-RateLimit-Remaining"].toString(),
        }),
      });
    }
  }
  if (
    typeof rateLimitHeaders?.["X-RateLimit-Limit"] === "undefined" ||
    typeof rateLimitHeaders?.["X-RateLimit-Remaining"] === "undefined"
  ) {
    console.log("⚠️ Did not find rate limit headers");
    return new Response(JSON.stringify({ error: "internal server error" }), {
      status: 500,
    });
  }

  const headers = new Headers({
    "X-RateLimit-Limit": rateLimitHeaders["X-RateLimit-Limit"].toString(),
    "X-RateLimit-Remaining":
      rateLimitHeaders["X-RateLimit-Remaining"].toString(),
  });

  if (!id) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      statusText: "Not found",
      headers: headers,
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

  headers.append("Content-Type", "application/json");

  return new Response(JSON.stringify(postReactionData), {
    status: 200,
    headers: headers,
  });
};

export const POST: APIRoute = async ({ request, params, clientAddress }) => {
  const id = params.id;
  const userIP = clientAddress;

  if (!import.meta.env.SECRET_APPWRITE_API_KEY) {
    return new Response(JSON.stringify({ error: "internal server error" }), {
      status: 500,
    });
  }

  let rateLimitHeaders: RateLimitHeaders | null = null;
  try {
    rateLimitHeaders = await Postlimiter.check(10, `POST-REACTIONS-${userIP}`);
  } catch (error: any) {
    if ("X-RateLimit-Limit" in error && "X-RateLimit-Remaining" in error) {
      const err = error as RateLimitHeaders;
      rateLimitHeaders = err;
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: new Headers({
          "X-RateLimit-Limit": err["X-RateLimit-Limit"].toString(),
          "X-RateLimit-Remaining": err["X-RateLimit-Remaining"].toString(),
        }),
      });
    }
  }

  if (
    typeof rateLimitHeaders?.["X-RateLimit-Limit"] === "undefined" ||
    typeof rateLimitHeaders?.["X-RateLimit-Remaining"] === "undefined"
  ) {
    console.log("⚠️ Did not find rate limit headers");
    return new Response(JSON.stringify({ error: "internal server error" }), {
      status: 500,
    });
  }

  const headers = new Headers({
    "X-RateLimit-Limit": rateLimitHeaders["X-RateLimit-Limit"].toString(),
    "X-RateLimit-Remaining":
      rateLimitHeaders["X-RateLimit-Remaining"].toString(),
  });

  if (!id) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      statusText: "Not found",
      headers: headers,
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
        headers: headers,
      });
    } catch (error) {
      console.log(`🚨 err when reacting to ID "${id}"!`, error);
    }
  }
  return new Response(null, { status: 400 });
};
