import "astro";
declare module "astro" {
  interface AstroClientDirectives {
    "client:appwrite"?: boolean;
  }
}
