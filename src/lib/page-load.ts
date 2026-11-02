/**
 * Run `init` for the current page now, and again whenever the page-transition
 * fallback (see `src/scripts/page-transition-fallback.ts`) swaps in a new page.
 *
 * The event name matches Astro's client router so Expressive Code's own
 * scripts, which already listen for it, re-initialise too.
 */
export const PAGE_LOAD_EVENT = "astro:page-load";

export function onPageLoad(init: () => void) {
	init();
	document.addEventListener(PAGE_LOAD_EVENT, init);
}
