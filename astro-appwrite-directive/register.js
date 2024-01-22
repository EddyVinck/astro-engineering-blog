/**
 * @type {() => import('astro').AstroIntegration}
 */
export default function register() {
  return {
    name: "client:appwrite",
    hooks: {
      "astro:config:setup": ({ addClientDirective }) => {
        console.log("appwrite directive setup");
        addClientDirective({
          name: "appwrite",
          entrypoint: "./astro-appwrite-directive/appwrite.js",
        });
      },
    },
  };
}
