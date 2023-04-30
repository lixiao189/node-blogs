import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
import siteMeta from "@/site-config";

const parser = new MarkdownIt();

export const get = async () => {
	const posts = await getCollection("post");

	return rss({
		title: siteMeta.title,
		description: siteMeta.description,
		stylesheet: "/rss-style.xsl",
		site: import.meta.env.SITE,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			content: sanitizeHtml(parser.render(post.body)),
			pubDate: post.data.publishDate,
			link: "/posts/" + post.slug,
		})),
	});
};
