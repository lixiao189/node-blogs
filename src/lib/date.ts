const longFormat = new Intl.DateTimeFormat("zh-CN", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

const shortFormat = new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" });

export const formatDate = (date: Date) => longFormat.format(date);

/** "10-28" style date for compact lists. */
export const formatShortDate = (date: Date) => shortFormat.format(date).replace("/", "-");
