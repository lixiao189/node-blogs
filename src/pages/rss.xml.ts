import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import sanitizeHtml from "sanitize-html";
import { getPosts, postUrl } from "@/lib/posts";
import { site } from "@/site.config";

export const GET: APIRoute = async (context) => {
	const posts = await getPosts();

	return rss({
		title: site.title,
		description: site.description,
		site: context.site ?? "",
		stylesheet: "/rss-style.xsl",
		trailingSlash: false,
		customData: `<language>${site.lang}</language>`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: postUrl(post),
			categories: post.data.tags,
			// The glob loader already rendered the Markdown, reuse it instead of re-parsing
			content: sanitizeHtml(post.rendered?.html ?? "", {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
			}),
		})),
	});
};
