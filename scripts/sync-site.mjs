import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const BASE_URL = "https://game.bago.top";
const SITE_NAME = "贝谷游戏";
const TODAY = new Date().toISOString().slice(0, 10);

const CATEGORY_ORDER = [
  "动作街机",
  "棋牌纸牌",
  "益智解谜",
  "学科练习",
  "创意工具",
];

const CATEGORY_META = {
  "动作街机": {
    emoji: "🎮",
    accent: "速度反应",
    description: "跑酷、躲避、打字和即时反应类小游戏合集。",
  },
  "棋牌纸牌": {
    emoji: "♟️",
    accent: "策略对局",
    description: "麻将、象棋、国际象棋、纸牌和多人桌游玩法合集。",
  },
  "益智解谜": {
    emoji: "🧩",
    accent: "脑力挑战",
    description: "数独、扫雷、拼图、连连看、2048 等经典益智游戏合集。",
  },
  "学科练习": {
    emoji: "🧪",
    accent: "边玩边学",
    description: "数学、物理、化学、英语、地理和历史等主题互动游戏。",
  },
  "创意工具": {
    emoji: "✨",
    accent: "轻松上手",
    description: "随机点名、钢琴练习、塔罗牌和课堂互动工具合集。",
  },
};

const STATIC_ENTRIES = [
  {
    slug: "4096",
    href: "/4096/",
    sourceFile: "4096/index.html",
    displayName: "4096",
    category: "益智解谜",
    emoji: "🔢",
    summary: "经典数字合成挑战，滑动方块不断翻倍，冲击更高分数。",
    keywords: ["4096", "数字合成", "益智游戏"],
  },
  {
    slug: "surf",
    href: "/surf/",
    sourceFile: "surf/index.html",
    displayName: "冲浪",
    category: "动作街机",
    emoji: "🏄",
    summary: "浏览器经典冲浪玩法，控制角色躲避障碍一路前进。",
    keywords: ["冲浪", "Surf", "跑酷游戏"],
  },
  {
    slug: "subway-surfers",
    href: "/SubwaySurfers/",
    sourceFile: "SubwaySurfers/index.html",
    displayName: "地铁跑酷",
    category: "动作街机",
    emoji: "🏃",
    summary: "经典跑酷小游戏，进入地铁场景快速闪避并挑战高分。",
    keywords: ["地铁跑酷", "跑酷游戏", "动作游戏"],
  },
  {
    slug: "dino",
    href: "/dino/",
    sourceFile: "dino/index.html",
    displayName: "小恐龙",
    category: "动作街机",
    emoji: "🦖",
    summary: "Chrome 经典离线小恐龙，点击即可起跳，节奏轻快耐玩。",
    keywords: ["小恐龙", "Dino", "离线游戏"],
  },
  {
    slug: "crossy-road",
    href: "/crossy-road/",
    sourceFile: "crossy-road/index.html",
    displayName: "天天过马路",
    category: "动作街机",
    emoji: "🐔",
    summary: "经典体素风格的无尽过马路游戏，控制角色躲避车辆、跳过河流、避开火车。",
    keywords: ["天天过马路", "Crossy Road", "跑酷游戏", "体素游戏"],
  },
];

const GAME_OVERRIDES = {
  "word-spelling": {
    summary: "英语单词拼写闯关小游戏，适合课堂练习和单词复习。",
  },
  "english-spelling": {
    summary: "英语单词拼写训练小游戏，结合听记和拼写巩固词汇。",
  },
  "random-name": {
    category: "创意工具",
    summary: "随机点名工具，适合课堂互动、抽签和团队小游戏。",
  },
  piano: {
    category: "创意工具",
    summary: "在线钢琴练习工具，支持键盘与点击演奏，轻松上手。",
  },
  tarot: {
    category: "创意工具",
    summary: "在线塔罗牌抽取体验，适合轻松娱乐和主题互动。",
  },
  "instrument-reading": {
    category: "创意工具",
    summary: "仪器读数练习小游戏，帮助熟悉常见实验仪表读数方式。",
  },
  multimeter: {
    category: "创意工具",
    summary: "多用电表读数训练页面，适合实验课堂和基础电学练习。",
  },
};

function readTitle(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!match) {
    throw new Error(`Missing <title> in ${filePath}`);
  }
  return { html, title: decodeHtml(match[1].trim()) };
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function cleanDisplayName(rawTitle) {
  const cleaned = rawTitle
    .replace(/\s*[-|]\s*元本AI\s*/gi, "")
    .replace(/\s*[-|]\s*贝谷游戏\s*/gi, "")
    .trim();

  return cleaned.split(" - ")[0].trim();
}

function categorizeGame(slug, displayName) {
  if (GAME_OVERRIDES[slug]?.category) {
    return GAME_OVERRIDES[slug].category;
  }

  if (/(surf|subway|dino|snake|typing-rain|whack-a-mole|crossy-road)/.test(slug)) {
    return "动作街机";
  }

  if (
    /(mahjong|xiangqi|chess|gomoku|dou-dizhu|uno|freecell|spider-solitaire|klondike|card-memory)/.test(
      slug,
    )
  ) {
    return "棋牌纸牌";
  }

  if (
    /(biology|chemistry|circuits|convex-lens|fraction|geography|geometry|globe|history|idiom|math|mechanism|periodic|physics|probability|programming|pulley|solar|solid|sorting|stroke|trigonometry|vocabulary|word-spelling|english-spelling|instrument|multimeter|buoyancy|chicken-rabbit)/.test(
      slug,
    )
  ) {
    return "学科练习";
  }

  if (/(random-name|piano|tarot)/.test(slug) || /读数|钢琴|塔罗|点名/.test(displayName)) {
    return "创意工具";
  }

  return "益智解谜";
}

function buildSummary(displayName, category) {
  switch (category) {
    case "动作街机":
      return `${displayName}是一款节奏轻快的动作街机小游戏，支持手机和电脑直接打开即玩。`;
    case "棋牌纸牌":
      return `${displayName}是一款适合随时开局的棋牌纸牌小游戏，兼顾休闲与策略体验。`;
    case "学科练习":
      return `${displayName}把知识点做成可互动的学科练习小游戏，适合边玩边学。`;
    case "创意工具":
      return `${displayName}提供轻量好用的互动体验，适合课堂、练习或休闲娱乐。`;
    default:
      return `${displayName}是一款经典耐玩的益智解谜小游戏，适合碎片时间随开随玩。`;
  }
}

function buildKeywords(entry) {
  const keywords = [
    entry.displayName,
    ...entry.keywords,
    entry.category,
    "在线小游戏",
    "网页游戏",
    SITE_NAME,
  ];

  return Array.from(new Set(keywords.filter(Boolean))).join(",");
}

function pickGameEmoji(slug, displayName, category) {
  const text = `${slug} ${displayName}`.toLowerCase();

  const emojiRules = [
    [/4096|2048|数独|数学|分数|24点|概率/, "🔢"],
    [/surf|冲浪/, "🏄"],
    [/subway|地铁跑酷|maze|迷宫/, "🏃"],
    [/dino|恐龙/, "🦖"],
    [/snake|贪吃蛇/, "🐍"],
    [/whack-a-mole|打地鼠/, "🔨"],
    [/typing|打字/, "⌨️"],
    [/mahjong|麻将/, "🀄"],
    [/象棋|xiangqi|chess|国际象棋/, "♟️"],
    [/五子棋|gomoku/, "⚫"],
    [/dou-dizhu|uno|freecell|solitaire|klondike|card-memory|纸牌/, "🃏"],
    [/hanoi|汉诺塔/, "🗼"],
    [/klotski|华容道/, "🚪"],
    [/连连看|matching|yang-le-ge-yang|羊了个羊/, "🧩"],
    [/minesweeper|扫雷/, "💣"],
    [/water-sort|水排序/, "🫧"],
    [/tangram|七巧板|puzzle|拼图|nonogram|数织|onestroke|一笔画/, "🧠"],
    [/witch-potion|女巫|chemistry|化学|periodic|元素/, "🧪"],
    [/biology|生物/, "🧬"],
    [/physics|物理|circuits|电路|convex-lens|透镜|pulley|滑轮|mechanism|机械|buoyancy|浮力/, "🔬"],
    [/globe|geography|地理|solar-system|太阳系/, "🌍"],
    [/history|历史/, "📜"],
    [/programming|编程|sorting|排序/, "💻"],
    [/stroke|笔画|idiom|成语|vocabulary|词汇|spelling|英语/, "📚"],
    [/piano|钢琴/, "🎹"],
    [/tarot|塔罗/, "🔮"],
    [/random-name|点名/, "🎲"],
    [/instrument|仪器|multimeter|电表/, "📏"],
  ];

  for (const [pattern, emoji] of emojiRules) {
    if (pattern.test(text)) {
      return emoji;
    }
  }

  const fallbackMap = {
    "动作街机": "🎮",
    "棋牌纸牌": "♟️",
    "益智解谜": "🧩",
    "学科练习": "🧪",
    "创意工具": "✨",
  };

  return fallbackMap[category] ?? "🎯";
}

function buildDynamicEntries() {
  const gamesDir = path.join(ROOT_DIR, "games");
  const files = fs
    .readdirSync(gamesDir)
    .filter((name) => name.endsWith(".html"))
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  return files.map((file) => {
    const slug = file.replace(/\.html$/i, "");
    const sourceFile = path.join("games", file);
    const { title } = readTitle(path.join(ROOT_DIR, sourceFile));
    const displayName = GAME_OVERRIDES[slug]?.displayName ?? cleanDisplayName(title);
    const category = categorizeGame(slug, displayName);
    const summary = GAME_OVERRIDES[slug]?.summary ?? buildSummary(displayName, category);

    return {
      slug,
      href: `/games/${file}`,
      sourceFile,
      displayName,
      category,
      emoji: pickGameEmoji(slug, displayName, category),
      summary,
      keywords: [],
    };
  });
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const categoryDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (categoryDiff !== 0) {
      return categoryDiff;
    }
    return a.displayName.localeCompare(b.displayName, "zh-Hans-CN");
  });
}

function buildSeoMeta(entry) {
  const title = `${entry.displayName} - 在线${entry.category}小游戏 | ${SITE_NAME}`;
  const description = `${entry.summary}在${SITE_NAME}支持手机、平板和电脑浏览器直接打开，无需下载。`;
  const keywords = buildKeywords(entry);
  const canonical = `${BASE_URL}${entry.href}`;

  return { title, description, keywords, canonical };
}

function buildSeoBlock(entry) {
  const meta = buildSeoMeta(entry);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: entry.displayName,
    description: meta.description,
    url: meta.canonical,
    genre: entry.category,
    inLanguage: "zh-CN",
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
  };

  return [
    "    <!-- SEO:BEGIN -->",
    `    <meta name="description" content="${escapeAttr(meta.description)}">`,
    `    <meta name="keywords" content="${escapeAttr(meta.keywords)}">`,
    '    <meta name="robots" content="index,follow,max-image-preview:large">',
    `    <link rel="canonical" href="${meta.canonical}">`,
    '    <meta property="og:type" content="website">',
    `    <meta property="og:title" content="${escapeAttr(meta.title)}">`,
    `    <meta property="og:description" content="${escapeAttr(meta.description)}">`,
    `    <meta property="og:url" content="${meta.canonical}">`,
    `    <meta property="og:site_name" content="${SITE_NAME}">`,
    `    <meta property="og:image" content="${BASE_URL}/favicon.png">`,
    '    <meta name="twitter:card" content="summary_large_image">',
    `    <meta name="twitter:title" content="${escapeAttr(meta.title)}">`,
    `    <meta name="twitter:description" content="${escapeAttr(meta.description)}">`,
    `    <meta name="twitter:image" content="${BASE_URL}/favicon.png">`,
    '    <meta name="theme-color" content="#0f766e">',
    '    <link rel="icon" href="/favicon.png">',
    '    <meta name="google-adsense-account" content="ca-pub-3709160807018181">',
    '    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3709160807018181" crossorigin="anonymous"></script>',
    `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
    "    <!-- SEO:END -->",
  ].join("\n");
}

function upsertSeo(html, seoBlock) {
  if (html.includes("<!-- SEO:BEGIN -->")) {
    return html.replace(/^[ \t]*<!-- SEO:BEGIN -->[\s\S]*?^[ \t]*<!-- SEO:END -->\n?/m, `${seoBlock}\n`);
  }

  return html.replace(/(<title\b[^>]*>[\s\S]*?<\/title>\s*)/i, `$1\n${seoBlock}\n`);
}

function stripLegacySeo(html) {
  return html
    .replace(/^[ \t]*<meta\s+name="description"[^>]*>\s*\n?/gim, "")
    .replace(/^[ \t]*<meta\s+name="keywords"[^>]*>\s*\n?/gim, "")
    .replace(/^[ \t]*<meta\s+name="robots"[^>]*>\s*\n?/gim, "")
    .replace(/^[ \t]*<meta\s+name="twitter:[^"]*"[^>]*>\s*\n?/gim, "")
    .replace(/^[ \t]*<meta\s+property="og:[^"]*"[^>]*>\s*\n?/gim, "")
    .replace(/^[ \t]*<link\s+rel="canonical"[^>]*>\s*\n?/gim, "")
    .replace(/^[ \t]*<meta\s+name="theme-color"[^>]*>\s*\n?/gim, "")
    .replace(/^[ \t]*<meta\s+name="google-adsense-account"[^>]*>\s*\n?/gim, "")
    .replace(/^[ \t]*<script[^>]*adsbygoogle\.js[^>]*><\/script>\s*\n?/gim, "");
}

function syncPageSeo(entry) {
  const filePath = path.join(ROOT_DIR, entry.sourceFile);
  let html = fs.readFileSync(filePath, "utf8");
  const meta = buildSeoMeta(entry);

  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = html.replace(/元本AI/g, SITE_NAME);
  html = stripLegacySeo(html);
  html = upsertSeo(html, buildSeoBlock(entry));

  if (entry.sourceFile === "dino/index.html") {
    html = html.replace(/<link href="favicon\.png" rel="icon"><\/head>\s*/i, '<link href="favicon.png" rel="icon">\n');
  }

  fs.writeFileSync(filePath, html);
}

function groupByCategory(entries) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    meta: CATEGORY_META[category],
    items: entries.filter((entry) => entry.category === category),
  })).filter((group) => group.items.length > 0);
}

function buildItemList(entries) {
  return entries.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${BASE_URL}${entry.href}`,
    name: entry.displayName,
  }));
}

function buildHomePage(entries) {
  const groups = groupByCategory(entries);
  const totalCount = entries.length;
  const categoryCards = groups
    .map(
      (group) => `
        <a class="category-card" href="#section-${escapeAttr(group.category)}">
            <span class="category-card__icon" aria-hidden="true">${group.meta.emoji}</span>
            <span class="category-card__eyebrow">${group.meta.accent}</span>
            <strong>${group.category}</strong>
            <p>${group.meta.description}</p>
            <span class="category-card__count">${group.items.length} 款游戏</span>
        </a>`,
    )
    .join("");

  const sections = groups
    .map((group) => {
      const cards = group.items
        .map((entry) => {
          return `
            <a class="game-card" href="${entry.href}" data-title="${escapeAttr(entry.displayName)}" data-category="${escapeAttr(entry.category)}" data-summary="${escapeAttr(entry.summary)}">
                <span class="game-card__badge" aria-hidden="true">${entry.emoji}</span>
                <div class="game-card__content">
                    <span class="game-card__tag">${group.meta.accent}</span>
                    <h3>${entry.displayName}</h3>
                    <p>${entry.summary}</p>
                </div>
            </a>`;
        })
        .join("");

      return `
        <section class="category-section" id="section-${escapeAttr(group.category)}">
            <div class="section-heading">
                <div>
                    <p class="section-heading__eyebrow">${group.meta.accent}</p>
                    <h2>${group.category}</h2>
                    <p>${group.meta.description}</p>
                </div>
                <span class="section-heading__count">${group.items.length} 款</span>
            </div>
            <div class="cards-grid">
                ${cards}
            </div>
        </section>`;
    })
    .join("");

  const homeDescription =
    "贝谷游戏收录大量在线小游戏，覆盖数独、扫雷、2048、麻将、象棋、跑酷、英语拼写、化学、物理和地理等主题，支持手机和电脑浏览器直接打开即玩。";

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL,
      inLanguage: "zh-CN",
      description: homeDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${SITE_NAME}在线小游戏大全`,
      url: `${BASE_URL}/`,
      description: homeDescription,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: BASE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${SITE_NAME}游戏目录`,
      itemListElement: buildItemList(entries),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "贝谷游戏需要下载安装吗？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "不需要，大部分游戏都支持在手机、平板和电脑浏览器中直接打开即玩。",
          },
        },
        {
          "@type": "Question",
          name: "贝谷游戏有哪些类型？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "本站收录动作街机、棋牌纸牌、益智解谜、学科练习和创意工具等多个分类，适合休闲娱乐和课堂互动。",
          },
        },
        {
          "@type": "Question",
          name: "怎么更快找到想玩的游戏？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "可以直接使用首页搜索框输入游戏名、学科名称或玩法关键词，也可以按分类浏览动作街机、棋牌纸牌、益智解谜、学科练习和创意工具等专区。",
          },
        },
      ],
    },
  ];

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>贝谷游戏 - 在线小游戏大全 | 益智、棋牌、动作、学习类游戏</title>
    <meta name="description" content="${escapeAttr(homeDescription)}">
    <meta name="keywords" content="贝谷游戏,在线小游戏,网页游戏,益智游戏,棋牌游戏,数独,扫雷,2048,中国象棋,麻将,英语拼写,物理化学游戏">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="${BASE_URL}/">
    <link rel="icon" href="/favicon.png">
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">
    <meta property="og:type" content="website">
    <meta property="og:title" content="贝谷游戏 - 在线小游戏大全">
    <meta property="og:description" content="${escapeAttr(homeDescription)}">
    <meta property="og:url" content="${BASE_URL}/">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:image" content="${BASE_URL}/favicon.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="贝谷游戏 - 在线小游戏大全">
    <meta name="twitter:description" content="${escapeAttr(homeDescription)}">
    <meta name="twitter:image" content="${BASE_URL}/favicon.png">
    <meta name="theme-color" content="#0f766e">
    <meta name="google-adsense-account" content="ca-pub-3709160807018181">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3709160807018181" crossorigin="anonymous"></script>
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
    <style>
        :root {
            --bg: #f3fbf8;
            --bg-soft: #eef6ff;
            --surface: rgba(255, 255, 255, 0.82);
            --surface-strong: #ffffff;
            --line: rgba(15, 23, 42, 0.1);
            --text: #102a43;
            --muted: #486581;
            --primary: #0f766e;
            --primary-soft: #ccfbf1;
            --secondary: #1d4ed8;
            --shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
            --radius-xl: 28px;
            --radius-lg: 22px;
            --radius-md: 18px;
            --font-sans: "Avenir Next", "Trebuchet MS", "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        * {
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            margin: 0;
            color: var(--text);
            font-family: var(--font-sans);
            background:
                radial-gradient(circle at top left, rgba(29, 78, 216, 0.12), transparent 28%),
                radial-gradient(circle at top right, rgba(15, 118, 110, 0.18), transparent 24%),
                linear-gradient(180deg, #f7fffd 0%, #eef7ff 55%, #f9fbff 100%);
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        .shell {
            width: min(1200px, calc(100% - 32px));
            margin: 0 auto;
        }

        .hero {
            padding: 28px 0 42px;
        }

        .hero__panel {
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 36px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(37, 99, 235, 0.09) 48%, rgba(255, 255, 255, 0.86) 100%);
            box-shadow: var(--shadow);
            padding: 28px;
        }

        .hero__panel::after {
            content: "";
            position: absolute;
            inset: auto -80px -120px auto;
            width: 260px;
            height: 260px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.24), rgba(59, 130, 246, 0));
            pointer-events: none;
        }

        .hero__top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 32px;
        }

        .brand {
            display: inline-flex;
            align-items: center;
            gap: 14px;
        }

        .brand__mark {
            width: 52px;
            height: 52px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            background: rgba(255, 255, 255, 0.92);
            box-shadow: 0 8px 16px rgba(15, 118, 110, 0.12);
            overflow: hidden;
        }

        .brand__mark img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }

        .brand__text strong {
            display: block;
            font-size: 1.2rem;
            letter-spacing: 0.04em;
        }

        .brand__text span {
            display: block;
            margin-top: 4px;
            color: var(--muted);
            font-size: 0.95rem;
        }

        .hero__nav {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .hero__nav a {
            padding: 10px 14px;
            border-radius: 999px;
            border: 1px solid rgba(15, 118, 110, 0.12);
            background: rgba(255, 255, 255, 0.66);
            color: var(--muted);
            font-size: 0.92rem;
            transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .hero__nav a:hover {
            color: var(--primary);
            transform: translateY(-1px);
            border-color: rgba(15, 118, 110, 0.28);
        }

        .hero__content {
            display: grid;
            grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.9fr);
            gap: 24px;
            align-items: end;
        }

        .eyebrow {
            margin: 0 0 12px;
            color: var(--primary);
            font-size: 0.95rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        h1 {
            margin: 0;
            font-size: clamp(2.6rem, 7vw, 4.8rem);
            line-height: 0.95;
            letter-spacing: -0.04em;
        }

        .hero__lead {
            margin: 18px 0 0;
            max-width: 720px;
            font-size: 1.06rem;
            line-height: 1.75;
            color: var(--muted);
        }

        .hero__stats {
            margin-top: 24px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
        }

        .stat {
            padding: 18px;
            border-radius: var(--radius-md);
            border: 1px solid rgba(15, 23, 42, 0.06);
            background: rgba(255, 255, 255, 0.74);
        }

        .stat strong {
            display: block;
            font-size: 1.9rem;
            line-height: 1;
        }

        .stat span {
            display: block;
            margin-top: 8px;
            color: var(--muted);
            font-size: 0.92rem;
        }

        .search-panel {
            padding: 22px;
            border-radius: var(--radius-xl);
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid rgba(15, 23, 42, 0.08);
            backdrop-filter: blur(8px);
        }

        .search-panel h2 {
            margin: 0;
            font-size: 1.28rem;
        }

        .search-panel p {
            margin: 10px 0 18px;
            color: var(--muted);
            line-height: 1.7;
        }

        .search-panel input {
            width: 100%;
            padding: 14px 16px;
            border-radius: 16px;
            border: 1px solid rgba(15, 23, 42, 0.12);
            font: inherit;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-panel input:focus {
            border-color: rgba(15, 118, 110, 0.4);
            box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
        }

        .search-panel__hint {
            margin-top: 12px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            color: var(--muted);
            font-size: 0.9rem;
        }

        .section {
            padding: 22px 0 8px;
        }

        .section h2 {
            margin: 0;
            font-size: clamp(1.8rem, 4vw, 2.4rem);
            letter-spacing: -0.03em;
        }

        .section > p {
            margin: 14px 0 0;
            max-width: 780px;
            color: var(--muted);
            line-height: 1.8;
        }

        .category-grid {
            margin-top: 24px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
        }

        .category-card {
            padding: 22px;
            border-radius: var(--radius-lg);
            background: var(--surface);
            border: 1px solid var(--line);
            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.03);
            transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .category-card:hover,
        .game-card:hover {
            transform: translateY(-4px);
            border-color: rgba(15, 118, 110, 0.28);
        }

        .category-card__eyebrow,
        .section-heading__eyebrow,
        .game-card__tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: var(--primary);
            font-size: 0.86rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .category-card__icon {
            width: 52px;
            height: 52px;
            display: grid;
            place-items: center;
            border-radius: 18px;
            font-size: 1.7rem;
            background: linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(37, 99, 235, 0.14));
        }

        .category-card strong {
            display: block;
            margin-top: 14px;
            font-size: 1.25rem;
        }

        .category-card p {
            margin: 10px 0 0;
            color: var(--muted);
            line-height: 1.7;
        }

        .category-card__count {
            display: inline-block;
            margin-top: 16px;
            color: var(--secondary);
            font-weight: 700;
        }

        .category-section {
            padding: 34px 0 8px;
        }

        .section-heading {
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 18px;
        }

        .section-heading h2 {
            margin-top: 10px;
        }

        .section-heading p {
            margin: 10px 0 0;
            color: var(--muted);
            line-height: 1.7;
        }

        .section-heading__count {
            white-space: nowrap;
            padding: 10px 14px;
            border-radius: 999px;
            background: var(--primary-soft);
            color: var(--primary);
            font-weight: 700;
        }

        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }

        .game-card {
            display: grid;
            grid-template-columns: 56px 1fr;
            gap: 16px;
            padding: 18px;
            border-radius: var(--radius-lg);
            background: var(--surface-strong);
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.03);
            transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .game-card__badge {
            width: 56px;
            height: 56px;
            display: grid;
            place-items: center;
            border-radius: 18px;
            background: linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(37, 99, 235, 0.16));
            font-size: 1.8rem;
            line-height: 1;
        }

        .game-card__content h3 {
            margin: 10px 0 8px;
            font-size: 1.18rem;
        }

        .game-card__content p {
            margin: 0;
            color: var(--muted);
            line-height: 1.72;
            font-size: 0.95rem;
        }

        .seo-block {
            margin-top: 22px;
            padding: 26px;
            border-radius: var(--radius-xl);
            background: rgba(255, 255, 255, 0.82);
            border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .faq {
            margin: 24px 0 48px;
            display: grid;
            gap: 14px;
        }

        .faq details {
            padding: 20px 22px;
            border-radius: var(--radius-lg);
            background: rgba(255, 255, 255, 0.84);
            border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .faq summary {
            cursor: pointer;
            font-weight: 700;
        }

        .faq p {
            margin: 12px 0 0;
            color: var(--muted);
            line-height: 1.78;
        }

        footer {
            padding: 28px 0 46px;
            color: var(--muted);
        }

        .footer__panel {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            flex-wrap: wrap;
            padding: 22px 24px;
            border-radius: var(--radius-xl);
            background: rgba(255, 255, 255, 0.78);
            border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .footer__links {
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
        }

        .footer__links a:hover {
            color: var(--primary);
        }

        [hidden] {
            display: none !important;
        }

        @media (max-width: 920px) {
            .hero__content {
                grid-template-columns: 1fr;
            }

            .hero__stats {
                grid-template-columns: repeat(3, minmax(0, 1fr));
            }
        }

        @media (max-width: 720px) {
            .shell {
                width: min(100% - 20px, 1200px);
            }

            .hero {
                padding-top: 14px;
            }

            .hero__panel {
                border-radius: 28px;
                padding: 20px;
            }

            .hero__stats {
                grid-template-columns: 1fr;
            }

            .section-heading,
            .footer__panel {
                align-items: start;
                flex-direction: column;
            }

            .game-card {
                grid-template-columns: 48px 1fr;
                gap: 14px;
            }

            .game-card__badge {
                width: 48px;
                height: 48px;
                border-radius: 16px;
            }
        }
    </style>
</head>
<body>
    <header class="hero">
        <div class="shell">
            <div class="hero__panel">
                <div class="hero__top">
                    <a class="brand" href="/">
                        <span class="brand__mark">
                            <img src="/favicon.png" alt="贝谷游戏 logo" width="144" height="144">
                        </span>
                        <span class="brand__text">
                            <strong>${SITE_NAME}</strong>
                            <span>在线小游戏大全</span>
                        </span>
                    </a>
                    <nav class="hero__nav" aria-label="首页分类导航">
                        ${groups
                          .map((group) => `<a href="#section-${escapeAttr(group.category)}">${group.category}</a>`)
                          .join("")}
                    </nav>
                </div>

                <div class="hero__content">
                    <div>
                        <p class="eyebrow">Web Games Directory</p>
                        <h1>打开即玩，轻松找到下一款好游戏</h1>
                        <p class="hero__lead">贝谷游戏聚合了动作街机、棋牌纸牌、益智解谜、学科练习和创意工具等多个分类。现在已收录 ${totalCount} 款在线小游戏，支持手机与电脑浏览器直接访问，无需下载安装。</p>
                        <div class="hero__stats">
                            <div class="stat">
                                <strong>${totalCount}</strong>
                                <span>已收录游戏</span>
                            </div>
                            <div class="stat">
                                <strong>${groups.length}</strong>
                                <span>主题分类</span>
                            </div>
                            <div class="stat">
                                <strong>0 下载</strong>
                                <span>浏览器即开即玩</span>
                            </div>
                        </div>
                    </div>

                    <aside class="search-panel" aria-label="站内游戏搜索">
                        <h2>快速搜索游戏</h2>
                        <p>可以直接搜索游戏名、分类或关键词，比如 “数独”、“麻将”、“英语”、“物理”、“跑酷”。</p>
                        <label for="site-search" class="visually-hidden">搜索游戏</label>
                        <input id="site-search" type="search" placeholder="输入游戏名或关键词" autocomplete="off">
                        <div class="search-panel__hint">
                            <span id="search-count">当前展示 ${totalCount} 款游戏</span>
                            <span>最近更新：${TODAY}</span>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    </header>

    <main class="shell">
        <section class="section">
            <h2>按分类找入口</h2>
            <p>从经典益智到棋牌桌游，再到英语、物理、化学等互动练习，这里已经按玩法和主题整理好了。你可以先逛熟悉的分类，也可以直接搜索想玩的游戏名。</p>
            <div class="category-grid">
                ${categoryCards}
            </div>
        </section>

        ${sections}

        <section class="section">
            <div class="seo-block">
                <h2>海量在线小游戏，覆盖休闲娱乐与课堂互动</h2>
                <p>${SITE_NAME}不仅收录了数独、扫雷、2048、华容道、拼图、连连看、打地鼠、贪吃蛇、冲浪、小恐龙等经典网页游戏，也提供麻将、中国象棋、国际象棋、五子棋、斗地主、UNO、纸牌接龙等棋牌纸牌玩法。同时，站内还有英语拼写、词汇卡片、汉字笔画、地理问答、历史时间线、化学元素周期表、物理电路、浮力仿真、太阳系、三角函数、概率模拟等学科互动内容，适合学生练习、课堂演示和碎片化学习。</p>
            </div>
        </section>

        <section class="section">
            <h2>常见问题</h2>
            <div class="faq">
                <details>
                    <summary>这些游戏在手机上能玩吗？</summary>
                    <p>大部分页面都支持移动端和桌面端浏览器直接访问，无需安装应用。首页入口已统一使用清晰的文字目录，便于从搜索引擎或收藏夹直接打开。</p>
                </details>
                <details>
                    <summary>怎么更快找到想玩的游戏？</summary>
                    <p>可以直接在首页顶部搜索框输入游戏名称、玩法或学科关键词，也可以先按分类浏览，再从卡片描述里快速判断是否适合自己。</p>
                </details>
                <details>
                    <summary>网站最近在体验上做了哪些提升？</summary>
                    <p>我们重新梳理了首页的分类目录，帮助大家更快速地找到想玩的游戏。同时，优化了各款小游戏的名称和介绍，改善了分享给好友时的卡片展示效果。底层也进行了一系列技术升级，让大家在手机和电脑上“打开即玩”的体验更加流畅。</p>
                </details>
            </div>
        </section>
    </main>

    <footer>
        <div class="shell">
            <div class="footer__panel">
                <div>
                    <strong>${SITE_NAME}</strong>
                    <div>© bago 2026</div>
                </div>
                <div class="footer__links">
                    <a href="https://about.bago.top/privacy.html">服务协议</a>
                    <a href="https://about.bago.top/privacy.html">隐私政策</a>
                    <a href="https://about.bago.top/feedback.html">意见反馈</a>
                </div>
            </div>
        </div>
    </footer>

    <script>
        const input = document.getElementById("site-search");
        const cards = Array.from(document.querySelectorAll(".game-card"));
        const sections = Array.from(document.querySelectorAll(".category-section"));
        const searchCount = document.getElementById("search-count");
        const total = cards.length;

        function updateSearch() {
            const keyword = input.value.trim().toLowerCase();
            let visibleCount = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.category,
                    card.dataset.summary,
                ].join(" ").toLowerCase();

                const matched = !keyword || haystack.includes(keyword);
                card.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
            });

            sections.forEach((section) => {
                const hasVisibleCard = Array.from(section.querySelectorAll(".game-card")).some((card) => !card.hidden);
                section.hidden = !hasVisibleCard;
            });

            searchCount.textContent = keyword
                ? "搜索结果 " + visibleCount + " 款 / 共 " + total + " 款"
                : "当前展示 " + total + " 款游戏";
        }

        input.addEventListener("input", updateSearch);
    </script>
</body>
</html>
`;
}

function build404Page() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面未找到 | ${SITE_NAME}</title>
    <meta name="description" content="抱歉，你访问的页面不存在。可以返回贝谷游戏首页继续浏览最新在线小游戏。">
    <meta name="robots" content="noindex,follow">
    <link rel="canonical" href="${BASE_URL}/404.html">
    <link rel="icon" href="/favicon.png">
    <meta name="theme-color" content="#0f766e">
    <meta name="google-adsense-account" content="ca-pub-3709160807018181">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3709160807018181" crossorigin="anonymous"></script>
    <style>
        :root {
            --bg: #eff8ff;
            --text: #102a43;
            --muted: #486581;
            --primary: #0f766e;
            --card: rgba(255, 255, 255, 0.86);
            --line: rgba(15, 23, 42, 0.08);
            --font-sans: "Avenir Next", "Trebuchet MS", "PingFang SC", "Microsoft YaHei", sans-serif;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background:
                radial-gradient(circle at top left, rgba(29, 78, 216, 0.12), transparent 26%),
                radial-gradient(circle at bottom right, rgba(15, 118, 110, 0.16), transparent 30%),
                linear-gradient(180deg, #f8fffd 0%, #eef7ff 100%);
            color: var(--text);
            font-family: var(--font-sans);
        }

        .card {
            width: min(100%, 720px);
            padding: 36px;
            border-radius: 32px;
            background: var(--card);
            border: 1px solid var(--line);
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
            text-align: center;
        }

        .code {
            margin: 0;
            font-size: clamp(4rem, 12vw, 7rem);
            line-height: 1;
            letter-spacing: -0.08em;
            color: var(--primary);
        }

        h1 {
            margin: 14px 0 0;
            font-size: clamp(1.8rem, 5vw, 2.6rem);
        }

        p {
            margin: 14px auto 0;
            max-width: 520px;
            line-height: 1.8;
            color: var(--muted);
        }

        .actions {
            margin-top: 28px;
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 156px;
            padding: 14px 18px;
            border-radius: 999px;
            border: 1px solid transparent;
            font-weight: 700;
        }

        .button--primary {
            background: linear-gradient(135deg, #0f766e, #1d4ed8);
            color: white;
        }

        .button--secondary {
            border-color: rgba(15, 23, 42, 0.12);
            background: white;
        }
    </style>
</head>
<body>
    <main class="card">
        <p class="code">404</p>
        <h1>这个页面暂时没有找到</h1>
        <p>你可以返回首页继续查看全部游戏入口，也可以直接打开站点地图页，看看最近新增了哪些在线小游戏。</p>
        <div class="actions">
            <a class="button button--primary" href="/">返回首页</a>
            <a class="button button--secondary" href="/sitemap.xml">查看站点地图</a>
        </div>
    </main>
</body>
</html>
`;
}

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
}

function buildSitemap(entries) {
  const urls = [
    { loc: `${BASE_URL}/`, priority: "1.0" },
    ...entries.map((entry) => ({
      loc: `${BASE_URL}${entry.href}`,
      priority: entry.category === "动作街机" ? "0.8" : "0.7",
    })),
  ];

  const body = urls
    .map(
      (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function ensureHomeHelpers(html) {
  if (html.includes(".visually-hidden")) {
    return html;
  }

  return html.replace(
    /(\[hidden\] \{\n            display: none !important;\n        \}\n)/,
    `$1\n        .visually-hidden {\n            position: absolute;\n            width: 1px;\n            height: 1px;\n            padding: 0;\n            margin: -1px;\n            overflow: hidden;\n            clip: rect(0, 0, 0, 0);\n            white-space: nowrap;\n            border: 0;\n        }\n`,
  );
}

function main() {
  const entries = sortEntries([...STATIC_ENTRIES, ...buildDynamicEntries()]);

  entries.forEach(syncPageSeo);

  const homePage = ensureHomeHelpers(buildHomePage(entries));
  fs.writeFileSync(path.join(ROOT_DIR, "index.html"), homePage);
  fs.writeFileSync(path.join(ROOT_DIR, "404.html"), build404Page());
  fs.writeFileSync(path.join(ROOT_DIR, "robots.txt"), buildRobotsTxt());
  fs.writeFileSync(path.join(ROOT_DIR, "sitemap.xml"), buildSitemap(entries));

  console.log(`Synced homepage, SEO metadata, robots.txt and sitemap.xml for ${entries.length} games.`);
}

main();
