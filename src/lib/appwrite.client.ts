import {
  Account,
  AppwriteException,
  Client,
  Databases,
  Storage,
  ID,
  type Models,
  Teams,
  Query,
} from "appwrite";
import { action, atom, type WritableAtom } from "nanostores";

// Adapted the code here from https://github.com/appwrite/demos-for-astro/blob/main/example-blog/src/lib/appwrite.ts

/** Setup */
export const appwriteClient = new Client()
  .setEndpoint(import.meta.env.PUBLIC_APPWRITE_ENDPOINT) // Your API Endpoint
  .setProject(import.meta.env.PUBLIC_APPWRITE_PROJECT_ID); // Your project ID

export const appwriteDatabases = new Databases(appwriteClient);
export const appwriteStorage = new Storage(appwriteClient);
export const appwriteTeams = new Teams(appwriteClient);

/** Account */
export const $isLoggedIn: WritableAtom<undefined | Models.Session> =
  atom(undefined);
export const setIsLoggedIn = action(
  $isLoggedIn,
  "setIsLoggedIn",
  (store, session: Models.Session | undefined) => {
    store.set(session);
  }
);

export const $user: WritableAtom<undefined | Models.User<Models.Preferences>> =
  atom(undefined);
export const setUser = action(
  $user,
  "setUser",
  (store, session: Models.User<Models.Preferences>) => {
    store.set(session);
  }
);

export const $isAuthor: WritableAtom<boolean> = atom(false);
export const setIsAuthor = action(
  $isAuthor,
  "setIsAuthor",
  (store, userIsAnAuthor: boolean) => {
    store.set(userIsAnAuthor);
  }
);

/** Database */
export interface BlogPost extends Models.Document {
  title: string;
  description: string;
  content: string;
  slug: string;
  imageUrl: string;
}
export interface BlogPostList extends Models.DocumentList<BlogPost> {}

export interface BlogComment extends Models.Document {
  postId: string;
  content: string;
}
export interface BlogCommentList extends Models.DocumentList<BlogComment> {}

/** Account */
export const appwriteAccount = new Account(appwriteClient);

// Check for session
appwriteAccount.getSession("current").then(
  function (response) {
    setIsLoggedIn(response);
  },
  function (_error) {
    setIsLoggedIn(undefined);
  }
);

$isLoggedIn.subscribe(async (session) => {
  if (session?.userId) {
    $user.set(await account());
  }
});

$isLoggedIn.subscribe(async (session) => {
  if (!session?.userId) return;
  const authorsMemberships = await appwriteTeams.listMemberships("authors", [
    Query.equal("userId", session.userId),
  ]);
  $isAuthor.set(authorsMemberships.total > 0);
});

export const login = async (email: string, password: string) => {
  try {
    const session = await appwriteAccount.createEmailSession(email, password);
    setIsLoggedIn(session);
    window.location.href = "/account";
  } catch (error) {
    const appwriteError = error as AppwriteException;
    alert(appwriteError.message);
  }
};

export const logout = async () => {
  try {
    const session = $isLoggedIn.get();
    if (session?.$id) {
      await appwriteAccount.deleteSession(session?.$id);
      setIsLoggedIn(undefined);
      window.location.href = "/";
    }
  } catch (error) {
    const appwriteError = error as AppwriteException;
    alert(appwriteError.message);
  }
};

export const register = async (email: string, password: string) => {
  try {
    await appwriteAccount.create(ID.unique(), email, password);
    const session = await appwriteAccount.createEmailSession(email, password);
    setIsLoggedIn(session);
    window.location.href = "/account";
  } catch (error) {
    const appwriteError = error as AppwriteException;
    alert(appwriteError.message);
  }
};

export const account = async () => {
  try {
    return appwriteAccount.get();
  } catch (error) {
    const appwriteError = error as AppwriteException;
    alert(appwriteError.message);
    return;
  }
};
