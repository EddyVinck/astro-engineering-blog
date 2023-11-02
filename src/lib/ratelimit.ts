// import type { NextApiResponse } from 'next'
import { LRUCache } from "lru-cache";

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export type RateLimitHeaders = Record<
  "X-RateLimit-Limit" | "X-RateLimit-Remaining",
  number
>;

/**
 * Adapted from a Next.js example
 * @see: https://github.com/vercel/next.js/blob/85abc48c901051ee91fe0849abf148ba59700a60/examples/api-routes-rate-limit/utils/rate-limit.ts
 *
 * This version just returns the headers instead of adding them to a response directly.
 */
export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<RateLimitHeaders>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0] as number;
        const isRateLimited = currentUsage >= limit;

        const headersToAdd: RateLimitHeaders = {
          "X-RateLimit-Limit": limit,
          "X-RateLimit-Remaining": isRateLimited ? 0 : limit - currentUsage,
        };

        return isRateLimited ? reject(headersToAdd) : resolve(headersToAdd);
      }),
  };
}
