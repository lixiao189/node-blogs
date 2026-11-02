/**
 * Page transitions for browsers without cross-document view transitions.
 *
 * Chrome and Safari animate page navigations natively through
 * `@view-transition { navigation: auto }` in global.css. Firefox only supports
 * same-document view transitions, so there each link click loads the next page
 * with no animation. For such browsers this script intercepts same-origin
 * navigations with the Navigation API, fetches the next page, and swaps it in
 * inside `document.startViewTransition()`, which reuses the same CSS animation
 * (including the reversed `back` type for history traversals).
 *
 * Browsers with native support never activate it.
 */
import { PAGE_LOAD_EVENT } from "@/lib/page-load";

// Minimal typings: the Navigation API is not in TypeScript's DOM lib everywhere yet
interface NavHistoryEntry {
	index: number;
}
interface NavigateEvent extends Event {
	canIntercept: boolean;
	hashChange: boolean;
	downloadRequest: string | null;
	formData: FormData | null;
	navigationType: "push" | "replace" | "reload" | "traverse";
	destination: { url: string; index: number };
	signal: AbortSignal;
	intercept(options: { handler: () => Promise<void>; scroll?: "manual" | "after-transition" }): void;
	scroll(): void;
}
interface NavigationApi extends EventTarget {
	currentEntry: NavHistoryEntry | null;
}

const navigation = (window as unknown as { navigation?: NavigationApi }).navigation;

const needed =
	!("onpagereveal" in window) && "startViewTransition" in document && navigation !== undefined;

if (needed) {
	// A script runs once per document; remember every one that already has
	const scriptKey = (s: HTMLScriptElement) =>
		s.src ? `src:${s.src}` : `inline:${s.type}:${s.textContent}`;
	const executed = new Set([...document.scripts].map(scriptKey));

	const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

	// Paths with a file extension (feeds, images, PDFs) are not pages
	const isPage = (url: URL) => !/\.(?!html?$)[a-z0-9]+$/i.test(url.pathname);

	navigation.addEventListener("navigate", (event) => {
		const e = event as NavigateEvent;
		if (!e.canIntercept || e.hashChange || e.downloadRequest !== null || e.formData) return;
		if (e.navigationType === "reload") return;

		const url = new URL(e.destination.url);
		if (url.origin !== location.origin || !isPage(url)) return;

		const from = navigation.currentEntry?.index ?? -1;
		const back = e.navigationType === "traverse" && e.destination.index < from;

		e.intercept({
			scroll: "manual",
			handler: async () => {
				let doc: Document;
				try {
					const res = await fetch(url, { signal: e.signal });
					if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) {
						throw new Error(`Unexpected response for ${url}`);
					}
					doc = new DOMParser().parseFromString(await res.text(), "text/html");
				} catch (err) {
					if (e.signal.aborted) return;
					// The URL has already changed, so a reload lands on the destination
					console.error(err);
					location.reload();
					return;
				}
				if (e.signal.aborted) return;

				const update = async () => {
					await swap(doc);
					try {
						e.scroll();
					} catch {
						scrollTo(0, 0);
					}
				};

				if (reducedMotion.matches) {
					await update();
				} else {
					const transition = document.startViewTransition({
						update,
						types: back ? ["back"] : [],
					});
					await transition.updateCallbackDone;
				}

				document.dispatchEvent(new Event(PAGE_LOAD_EVENT));
				runNewScripts();
				reportPageView();
			},
		});
	});

	// Scripts in the incoming page that have never run in this document
	let pending: HTMLScriptElement[] = [];

	async function swap(doc: Document) {
		document.title = doc.title;

		// Page metadata: drop the old page's, take the new page's
		const isMeta = (el: Element) =>
			el.matches("meta[name], meta[property], link:not([rel~='stylesheet']), script[type='application/ld+json']");
		for (const el of [...document.head.children]) if (isMeta(el)) el.remove();

		const styles: Promise<unknown>[] = [];
		const have = new Set(
			[...document.head.querySelectorAll<HTMLLinkElement>("link[rel~='stylesheet']")].map((l) => l.href),
		);
		pending = [];

		for (const el of [...doc.head.children]) {
			if (el instanceof HTMLScriptElement && el.type !== "application/ld+json") {
				if (!executed.has(scriptKey(el))) pending.push(el);
			} else if (el instanceof HTMLLinkElement && el.relList.contains("stylesheet")) {
				if (have.has(el.href)) continue;
				const link = document.importNode(el, true);
				styles.push(
					new Promise((resolve) => {
						link.addEventListener("load", resolve);
						link.addEventListener("error", resolve);
					}),
				);
				document.head.append(link);
			} else if (isMeta(el)) {
				document.head.append(document.importNode(el, true));
			}
		}
		// Hold the swap until the new page's styles are in, so it never flashes unstyled
		await Promise.all(styles);

		// Swap the body's contents but keep the element, so observers on it keep working
		for (const attr of [...document.body.attributes]) document.body.removeAttribute(attr.name);
		for (const attr of doc.body.attributes) document.body.setAttribute(attr.name, attr.value);
		document.body.replaceChildren(...[...doc.body.childNodes].map((n) => document.importNode(n, true)));

		for (const s of document.body.querySelectorAll("script")) {
			if (!executed.has(scriptKey(s))) pending.push(s);
		}
	}

	// Run scripts the new page brings that this document hasn't seen; scripts it
	// has already run re-initialise through the page-load event instead
	function runNewScripts() {
		for (const old of pending) {
			executed.add(scriptKey(old));
			const script = document.createElement("script");
			for (const attr of old.attributes) script.setAttribute(attr.name, attr.value);
			script.textContent = old.textContent;
			if (old.isConnected) old.replaceWith(script);
			else document.head.append(script);
		}
		pending = [];
	}

	function reportPageView() {
		const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
		gtag?.("event", "page_view", { page_location: location.href, page_title: document.title });
	}
}
