import { type APIRoute } from "astro";
import { getPostReactionsRanked } from "../../lib/appwrite/appwrite.server";

export const prerender = false;

export const GET: APIRoute = async (): Promise<Response> => {
  if (!import.meta.env.SECRET_APPWRITE_API_KEY) {
    return new Response(JSON.stringify({ error: "internal server error" }), {
      status: 500,
    });
  }

  let postReactionsRanked = null;
  postReactionsRanked = await getPostReactionsRanked();
  if (!postReactionsRanked) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  return new Response(JSON.stringify(postReactionsRanked), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
