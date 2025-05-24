import type { CollectionEntry } from "astro:content";

export function sortMDByDate(posts: CollectionEntry<"post">[] = []) {
	return posts.sort(
		(a, b) => new Date(b.data.publishDate).valueOf() - new Date(a.data.publishDate).valueOf(),
	);
}

export function getUniqueTags(posts: CollectionEntry<"post">[] = []) {
	const uniqueTags = new Set<string>();
	for (const post of posts) {
		post.data.tags.map((tag) => uniqueTags.add(tag));
	}
	return Array.from(uniqueTags);
}

export function getUniqueTagsWithCount(posts: CollectionEntry<"post">[] = []): {
	[key: string]: number;
} {
	return posts.reduce(
		(prev, post) => {
			for (const tag of post.data.tags) {
				prev[tag] = (prev[tag] || 0) + 1;
			}
			return prev;
		},
		{} as { [key: string]: number },
	);
}
