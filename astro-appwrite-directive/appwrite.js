// adapted from https://github.com/withastro/astro/blob/4e395a6cab27d79a785ca386114b6229d8f6a7b9/packages/astro/src/runtime/client/idle.ts

const appwrite = import.meta.env.PUBLIC_APPWRITE_ENDPOINT;
const isUsingAppwrite = !!appwrite;

/**
 * Hydrate on first click on the window
 * @type {import('astro').ClientDirective}
 */
const idleAppwriteDirective = (load) => {
  console.log({ aw: appwrite, isUsingAppwrite });
  if (!isUsingAppwrite) return;

  const cb = async () => {
    const hydrate = await load();
    await hydrate();
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(cb);
  } else {
    setTimeout(cb, 200);
  }
};

export default idleAppwriteDirective;
