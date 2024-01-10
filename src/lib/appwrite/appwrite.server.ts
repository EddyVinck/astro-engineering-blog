import {
  AppwriteException,
  Client,
  Databases,
  Storage,
  ID,
  type Models,
  Teams,
  Query,
} from "node-appwrite";
import type { CollectionEntry } from "astro:content";

/** Setup */
export const appwriteServerClient = new Client()
  .setEndpoint(import.meta.env.PUBLIC_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(import.meta.env.SECRET_APPWRITE_API_KEY);

export const appwriteDatabases = new Databases(appwriteServerClient);
export const appwriteStorage = new Storage(appwriteServerClient);
export const appwriteTeams = new Teams(appwriteServerClient);

const initializeEmojiReactionsCollection = async () => {
  try {
    await appwriteDatabases.get(import.meta.env.PUBLIC_APPWRITE_DATABASE_ID);
    console.log("✅ Database found!");
  } catch (error) {
    await appwriteDatabases.create(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      true
    );
    console.log(
      `Created new Appwrite database: ${
        import.meta.env.PUBLIC_APPWRITE_DATABASE_ID
      }`
    );
  }

  try {
    await appwriteDatabases.getCollection(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID
    );
    console.log("✅ Emoji reactions collection found!");
  } catch (error) {
    await appwriteDatabases.createCollection(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID,
      import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID
    );
    console.log(
      `Created new Appwrite collection: ${
        import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID
      }`
    );
  }
};

export interface PostReactions {
  id: string;
  likes: number;
  hearts: number;
  poops: number;
  parties: number;
}
export type PostReactionOption = Exclude<keyof PostReactions, "id">;
export interface PostReactionsDocument extends Models.Document, PostReactions {}

const getInitialPostData = (id: string): PostReactions => ({
  id: id,
  likes: 0,
  hearts: 0,
  poops: 0,
  parties: 0,
});

/**
 * This function should be called in `getStaticPaths` so that it only runs during build-time
 * It will attempt to add any new posts to a database collection
 * This will throw an AppwriteException (from `node-appwrite`) if it fails in one of the steps
 * It requires the following environment variables to be available:
 * - SECRET_APPWRITE_API_KEY
 * - PUBLIC_APPWRITE_DATABASE_ID
 * - PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID
 */
export const tryInitNewBlogPostsReactionsInDatabaseCollection = async (
  posts: Array<CollectionEntry<"blog">>
) => {
  if (!import.meta.env.SECRET_APPWRITE_API_KEY) {
    throw new AppwriteException("Could not find SECRET_APPWRITE_API_KEY");
  }

  await initializeEmojiReactionsCollection();

  const dbPosts = (
    await appwriteDatabases.listDocuments<PostReactionsDocument>(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID
    )
  ).documents;

  if (!dbPosts || !dbPosts.length) {
    console.log(
      `No posts found in ${
        import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID
      }`
    );
  } else {
    console.log(`Found ${dbPosts.length} posts in Appwrite!`);
  }

  const newPosts: PostReactions[] = [];
  // For every new post (an ID that didn't exist), initialize a new database collection entry
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    if (!post) continue;

    // check if the post is not in the collection yet
    if (!dbPosts.find(({ id }) => id === post.data.id)) {
      console.log("new post", post.data.id);
      newPosts.push(getInitialPostData(post.data.id));
    }
  }

  if (newPosts.length > 0) {
    const promises = newPosts.map((newPost) => {
      return appwriteDatabases.createDocument(
        import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
        import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID,
        ID.unique(),
        newPost
      );
    });

    Promise.all(promises)
      .then((results) => {
        console.log(
          `All new ${results.length} posts have been initialized, promises resolved:`,
          (results as PostReactionsDocument[]).map((p) => p.id)
        );
        return newPosts;
      })
      .catch((error) => {
        console.error(
          "An error occurred when trying to initialize new post reactions in the collection:",
          error
        );
      });
  }
};

function getGoodReactionCount(doc: PostReactions) {
  return doc.likes + doc.hearts + doc.parties;
}

export const getPostReactionsRanked = async (): Promise<
  PostReactions[] | null
> => {
  try {
    const list = await appwriteDatabases.listDocuments<PostReactionsDocument>(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID,
      [
        Query.orderDesc("likes"),
        Query.orderDesc("hearts"),
        Query.orderDesc("parties"),
        Query.orderDesc("poops"),
        Query.limit(20),
      ]
    );

    if (list.total === 0) {
      throw new Error(
        `Got ${list.total} results when querying post reaction rankings`
      );
    }

    return list.documents
      .map((doc) => ({
        id: doc.id,
        likes: doc.likes,
        hearts: doc.hearts,
        parties: doc.parties,
        poops: doc.poops,
      }))
      .sort((postA, postB) => {
        const goodReactionCountA = getGoodReactionCount(postA);
        const goodReactionCountB = getGoodReactionCount(postB);
        const badReactionsA = postA.poops;
        const badReactionsB = postB.poops;

        // First, compare based on good reactions
        if (goodReactionCountA > goodReactionCountB) {
          return -1;
        } else if (goodReactionCountA < goodReactionCountB) {
          return 1;
        }

        // If good reactions are equal, then compare based on bad reactions
        if (badReactionsA < badReactionsB) {
          return -1;
        } else if (badReactionsA > badReactionsB) {
          return 1;
        }

        return 0;
      });
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `Could not get post reaction data for ranking`,
        error.message
      );
    }
    return null;
  }
};

export const getPostReactionsById = async (id: string) => {
  try {
    const list = await appwriteDatabases.listDocuments<PostReactionsDocument>(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID,
      [Query.equal("id", [id])]
    );

    if (list.total !== 1) {
      throw new Error(
        `Got ${list.total} results when querying post reactions for "${id}"`
      );
    }

    const document = list.documents[0];

    return document;
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `Could not get post reaction data for "${id}"`,
        error.message
      );
    }
    return null;
  }
};

export const incrementEmojiReactionCount = async (
  articleId: string,
  emojiType: PostReactionOption
) => {
  const list = await appwriteDatabases.listDocuments<PostReactionsDocument>(
    import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
    import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID,
    [Query.equal("id", [articleId])]
  );

  if (list.total !== 1) {
    throw new Error(
      `Got ${list.total} results when querying post reactions for "${articleId}"`
    );
  }

  const document = list.documents[0];

  if (!document) {
    return;
  }

  const prevCount = document[emojiType];
  const newCount = prevCount + 1;

  const result = await appwriteDatabases.updateDocument<PostReactionsDocument>(
    import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
    import.meta.env.PUBLIC_APPWRITE_EMOJI_REACTIONS_COLLECTION_ID,
    document.$id,
    {
      [emojiType]: newCount,
    }
  );

  return result;
};
