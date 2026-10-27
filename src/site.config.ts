// Everything about the site that isn't a post lives here.

export const site = {
	author: "Node Sans",
	title: "Node Sans Blog",
	tagline: "二进制安全练习生的折腾笔记",
	description: "Node Sans 的博客：记录 PWN、逆向工程、开发工具链与日常折腾的笔记。",
	lang: "zh-CN",
	ogLocale: "zh_CN",
	twitter: "@node_sans",
	themeColorLight: "#fafafa",
	themeColorDark: "#18191b",
	postsPerHomePage: 8,
	verification: {
		google: "G5bRZ1EgBHiixPKY1FGAuSd8d0uNGUeaAkvFsCZS-zY",
		baidu: "codeva-dWQxQzDdMm",
	},
	googleAnalyticsId: "G-5W9PXP15TF",
} as const;

export const nav = [
	{ title: "首页", path: "/" },
	{ title: "文章", path: "/posts" },
	{ title: "标签", path: "/tags" },
	{ title: "关于", path: "/about" },
] as const;

export const socials = [
	{ name: "GitHub", icon: "github", href: "https://github.com/lixiao189" },
	{ name: "Twitter", icon: "twitter", href: "https://twitter.com/node_sans" },
	{ name: "Email", icon: "mail", href: "mailto:node189@icloud.com" },
	{ name: "RSS", icon: "rss", href: "/rss.xml" },
] as const;

export const friends = [
	{ name: "小高的博客", desc: "一个脱离了低级趣味的二进制佬", href: "https://blog.gaoyucan.site" },
	{ name: "S1ain 的博客", desc: "安徽 Web 佬", href: "https://gensokyo.cn/" },
	{ name: "Info 富哥的博客", desc: "澳爷👴", href: "https://blog.i1nfo.com/" },
	{ name: "好人 Simon 的博客", desc: "好人一生平安", href: "https://blog.polite.cat" },
	{ name: "冰冰的博客", desc: "这个冰冰就是勇啦", href: "https://zhul.in/links/" },
	{ name: "J10C 的博客", desc: "在杭大学生", href: "https://site.j10ccc.xyz/zh-cn/" },
	{ name: "派大星的博客", desc: "天无二日，忠诚！", href: "https://blog.cnpatrickstar.com/" },
	{ name: "姥爷的博客", desc: "意外的画风很可爱", href: "https://www.f1nley.xyz/" },
	{
		name: "望舒的尘歌壶",
		desc: "在高洁的冰之女皇麾下, 我们将攫取众神的权柄!",
		href: "https://blog.phlin.top/",
	},
	{ name: "杨骏的博客", desc: "狠狠做二进制", href: "https://le-premier-homme.top/" },
];
