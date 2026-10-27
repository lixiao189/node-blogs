import { type CollectionEntry, getCollection } from "astro:content";
import readingTime from "reading-time";

export type Post = CollectionEntry<"post">;

/** All published posts, newest first. Drafts are only visible in dev. */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection("post", ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export function postUrl(post: Post) {
	return `/posts/${post.id}`;
}

export function tagUrl(tag: string) {
	return `/tags/${tag}`;
}

/** Tags with their post count, most used first. */
export function getTagsWithCount(posts: Post[]) {
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function groupByYear(posts: Post[]) {
	const groups = new Map<number, Post[]>();
	for (const post of posts) {
		const year = post.data.publishDate.getFullYear();
		groups.set(year, [...(groups.get(year) ?? []), post]);
	}
	return [...groups];
}

/** Minutes to read, tuned for mixed Chinese/English text. */
export function getReadingMinutes(post: Post) {
	return Math.max(1, Math.round(readingTime(post.body ?? "", { wordsPerMinute: 300 }).minutes));
}

/** Newer and older neighbours of a post in the sorted list. */
export function getAdjacent(posts: Post[], post: Post) {
	const index = posts.findIndex((p) => p.id === post.id);
	return { newer: posts[index - 1], older: posts[index + 1] };
}
