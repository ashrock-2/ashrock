import type { MarkdownInstance } from "astro";
import type { Frontmatter } from "@src/types/Frontmatter";

export const getMostRecentPost = async (
  posts: MarkdownInstance<Frontmatter>[],
) => {
  if (posts.length > 0) {
    posts.sort(
      (a, b) =>
        new Date(b.frontmatter.pub_date).getTime() -
        new Date(a.frontmatter.pub_date).getTime(),
    );
    return posts[0];
  }
  return undefined;
};
