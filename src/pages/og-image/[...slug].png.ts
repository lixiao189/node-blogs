import { Resvg } from "@resvg/resvg-js";
import type { APIRoute, GetStaticPaths } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import { formatDate } from "@/lib/date";
import { type Post, getPosts } from "@/lib/posts";
import { site } from "@/site.config";

/**
 * Google Fonts returns a TTF containing only the requested glyphs when no browser
 * user agent is sent, which keeps a CJK font down to a few KB per build.
 */
async function loadFont(weight: number, text: string) {
	const api = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@${weight}&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(api)).text();
	const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
	if (!url) throw new Error(`Could not load Noto Sans SC ${weight} for OG images`);
	return (await fetch(url)).arrayBuffer();
}

let fonts: Promise<SatoriOptions["fonts"]> | undefined;

function getFonts(posts: Post[]) {
	fonts ??= (async () => {
		const text = [
			site.title,
			site.author,
			"#0123456789年月日 ",
			...posts.flatMap((p) => [p.data.title, ...p.data.tags]),
		].join("");
		const [regular, bold] = await Promise.all([loadFont(400, text), loadFont(700, text)]);
		return [
			{ name: "Noto Sans SC", data: regular, weight: 400, style: "normal" },
			{ name: "Noto Sans SC", data: bold, weight: 700, style: "normal" },
		] as SatoriOptions["fonts"];
	})();
	return fonts;
}

const markup = (title: string, date: string, tags: string[]) =>
	html`<div tw="flex flex-col w-full h-full bg-[#18191b] text-[#c9cacc] p-16">
		<div tw="flex items-center text-2xl text-[#2bbc89]">${tags.map((t) => `#${t}`).join("  ")}</div>
		<div tw="flex flex-1 items-center">
			<h1 tw="text-[64px] font-bold leading-tight text-white">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full pt-8 border-t-2 border-[#2f3135] text-2xl">
			<p tw="font-bold text-white">${site.title}</p>
			<p>${date}</p>
		</div>
	</div>`;

export const getStaticPaths = (async () => {
	const posts = await getPosts();
	return posts
		.filter((post) => !post.data.ogImage)
		.map((post) => ({ params: { slug: post.id }, props: { post, posts } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ post: Post; posts: Post[] }> = async ({ props: { post, posts } }) => {
	const { title, publishDate, tags } = post.data;
	const svg = await satori(markup(title, formatDate(publishDate), tags.slice(0, 4)), {
		width: 1200,
		height: 630,
		fonts: await getFonts(posts),
	});
	const png = new Resvg(svg).render().asPng();
	return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
