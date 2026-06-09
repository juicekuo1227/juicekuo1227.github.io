# 部落格「Aria 老師碎碎念」實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在現有靜態站新增 `/blog/`(「Aria 老師碎碎念」),含部落格首頁、3 篇 ~1000 字圖文並茂樣板文章、Gemini 插畫生成腳本與完整 SEO。

**Architecture:** 純靜態手寫 HTML,無建置流程。共用樣式抽到 `assets/blog.css`,沿用主站米色+金色設計語言。插畫用 Gemini `gemini-2.5-flash-image` 產 1024×1024 暖色扁平圖。每篇獨立 title/description/canonical/OG + Article JSON-LD,並加入 sitemap。

> **與 spec 的一處刻意調整**:spec §2 原寫「樣式抽到各 HTML 內的 `<style>`」,但部落格未來會到 11 頁,內嵌樣式 11 份重複違反 DRY。改用共用 `assets/blog.css`(`<link>` 載入)—— 仍是純靜態、無 build,只是更好維護。這是符合 spec 精神的小改良。

**Tech Stack:** HTML5、CSS(共用檔)、Google Fonts(沿用主站)、bash + curl + jq + Gemini API(產圖)、python3(驗證 JSON-LD)、GitHub Pages 部署。

**慣例:** 每個 task 結束 commit(只 commit,不 push;push 等使用者明確要求)。commit 訊息結尾加:
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

**測試說明:** 本站無單元測試框架。本計畫的「驗證」= 本地起 `python3 -m http.server`、用 `curl`/`python3` 檢查內容與 JSON-LD 合法性、Playwright 截圖確認視覺。這是 YAGNI 的合理做法,不為靜態頁另建測試框架。

---

## 檔案結構

```
scripts/gen-illustration.sh                         (建) 插畫生成腳本
assets/blog.css                                     (建) 部落格共用樣式
blog/index.html                                     (建) 部落格首頁(文章列表)
blog/choosing-first-instrument.html                 (建) 文章 1
blog/adult-beginner-never-too-late.html             (建) 文章 5
blog/lesson-formats-compared.html                   (建) 文章 9
assets/blog/choosing-first-instrument/{cover,inline-1,inline-2}.png      (建) 文章 1 插畫
assets/blog/adult-beginner-never-too-late/{cover,inline-1,inline-2}.png  (建) 文章 5 插畫
assets/blog/lesson-formats-compared/{cover,inline-1,inline-2}.png        (建) 文章 9 插畫
index.html                                          (改) 導覽列加「Aria 老師碎碎念」
sitemap.xml                                         (改) 加 /blog/ 與 3 篇文章
```

**3 篇文章 metadata(鎖定,後續 task 引用):**

| # | slug | H1 / 標題 | description |
|---|---|---|---|
| 1 | `choosing-first-instrument` | 怎麼幫孩子挑第一個樂器?鋼琴與長笛的特性比較 | 孩子想學音樂,第一個樂器選鋼琴還是長笛?Aria 老師從年齡、體格、個性與練習條件,聊聊怎麼幫孩子挑對入門樂器。 |
| 5 | `adult-beginner-never-too-late` | 成人零基礎學音樂會太晚嗎?關於年齡的迷思 | 「我這年紀還能學樂器嗎?」Aria 老師分享成人學音樂的優勢、常見迷思,以及用適合大人的方式輕鬆開始。 |
| 9 | `lesson-formats-compared` | 一對一、團體班、線上課怎麼選?三種上課方式比較 | 學樂器要選一對一、團體班還是線上課?Aria 老師比較三種方式的優缺點與適合對象,幫你找到最合適的學習方式。 |

`<title>` 一律為:`<H1>｜Aria 老師碎碎念`

---

## Task 1: 插畫生成腳本

**Files:**
- Create: `scripts/gen-illustration.sh`

- [ ] **Step 1: 建立腳本**

```bash
mkdir -p scripts
cat > scripts/gen-illustration.sh <<'SCRIPT'
#!/usr/bin/env bash
# 用法: scripts/gen-illustration.sh "<主體描述(英文)>" <輸出路徑.png>
# 依賴: GEMINI_API_KEY、jq、python3
set -euo pipefail
SUBJECT="${1:?需要主體描述}"
OUT="${2:?需要輸出路徑}"
: "${GEMINI_API_KEY:?GEMINI_API_KEY 未設定}"
STYLE="flat illustration, pastel colors, soft shadows, rounded shapes, centered composition, warm and friendly atmosphere, no text, no letters"
PROMPT="${SUBJECT}, ${STYLE}"
mkdir -p "$(dirname "$OUT")"
BODY="$(jq -n --arg p "$PROMPT" '{contents:[{parts:[{text:$p}]}]}')"
RESP="$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}" -H 'Content-Type: application/json' -d "$BODY")"
printf '%s' "$RESP" | python3 -c '
import sys,json,base64
d=json.load(sys.stdin)
if "error" in d:
    sys.stderr.write("API ERROR: "+str(d["error"].get("message",""))[:300]+"\n"); sys.exit(1)
img=None
for p in d.get("candidates",[{}])[0].get("content",{}).get("parts",[]):
    if "inlineData" in p: img=p["inlineData"]["data"]
if not img:
    sys.stderr.write("回應無圖像\n"); sys.exit(1)
open(sys.argv[1],"wb").write(base64.b64decode(img))
' "$OUT"
echo "✅ 產出 $OUT"
SCRIPT
chmod +x scripts/gen-illustration.sh
```

- [ ] **Step 2: 實測產一張圖驗證腳本可用**

Run:
```bash
./scripts/gen-illustration.sh "a child practicing piano at home with a parent watching warmly" /tmp/gentest.png
sips -g pixelWidth -g pixelHeight /tmp/gentest.png | grep pixel
```
Expected: 印出 `✅ 產出 /tmp/gentest.png`,尺寸 1024×1024。

- [ ] **Step 3: 清掉測試圖、commit**

```bash
rm -f /tmp/gentest.png
git add scripts/gen-illustration.sh
git commit -m "feat(blog): 新增 Gemini 插畫生成腳本

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 部落格共用樣式 `assets/blog.css`

**Files:**
- Create: `assets/blog.css`

設計沿用主站 token。共用樣式包含:`:root` 變數、字體 import、base、nav、麵包屑、文章容器(`.post`)、`h1/h2`、`figure`、`.post-list`/`.post-card`、`.callout`(重點整理)、`.cta`、footer。

- [ ] **Step 1: 建立 CSS 檔**

```bash
cat > assets/blog.css <<'CSS'
:root{
  --ivory:#F7F3EA; --paper:#FCFAF4; --ink:#211C16; --ink-soft:#5A4F43;
  --gold:#B08D4F; --gold-deep:#8C6E38; --wine:#6A2E37; --line:#DDD2BE;
  --display:"Cormorant Garamond",serif; --serif:"Noto Serif TC",serif; --sans:"Noto Sans TC",sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--ivory);color:var(--ink);line-height:1.95;font-weight:300;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
.wrap{width:min(820px,90vw);margin-inline:auto}
/* nav */
nav{position:sticky;top:0;z-index:50;background:rgba(247,243,234,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.nav-in{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 0;width:min(1080px,90vw);margin-inline:auto}
.logo{font-family:var(--display);font-size:1.5rem;letter-spacing:.06em;display:flex;align-items:center;gap:.6rem}
.logo b{font-weight:600}
.logo .em{width:32px;height:32px;border:1px solid var(--gold);border-radius:50%;display:grid;place-items:center;color:var(--gold-deep);font-family:var(--serif)}
.nav-back{font-size:.84rem;letter-spacing:.08em;color:var(--ink-soft)}
.nav-back:hover{color:var(--gold-deep)}
/* breadcrumb */
.crumb{font-size:.8rem;letter-spacing:.04em;color:var(--ink-soft);padding:1.6rem 0 0}
.crumb a:hover{color:var(--gold-deep)}
/* post */
.post{padding:1rem 0 3rem}
.post-head{text-align:center;margin:1.5rem 0 2.4rem}
.post-eyebrow{font-family:var(--display);font-style:italic;color:var(--gold);font-size:1.2rem}
.post h1{font-family:var(--serif);font-weight:500;font-size:clamp(1.7rem,4.2vw,2.5rem);line-height:1.4;letter-spacing:.03em;margin:.6rem 0}
.post-meta{font-size:.8rem;letter-spacing:.1em;color:var(--ink-soft);text-transform:uppercase}
.post-lead{font-family:var(--serif);font-size:1.1rem;color:var(--ink-soft);margin:1.4rem auto 0;max-width:34em}
.post figure{margin:2.4rem 0}
.post figure img{width:100%;border-radius:20px}
.post figure figcaption{text-align:center;font-size:.82rem;color:var(--ink-soft);margin-top:.7rem;font-family:var(--serif)}
.post h2{font-family:var(--serif);font-weight:500;font-size:clamp(1.3rem,2.6vw,1.7rem);letter-spacing:.04em;margin:2.6rem 0 1rem;padding-left:.8rem;border-left:3px solid var(--gold)}
.post p{margin:1rem 0;font-size:1.02rem}
.post strong{color:var(--gold-deep);font-weight:500}
/* callout 重點整理 */
.callout{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:1.6rem 1.8rem;margin:2.6rem 0}
.callout h3{font-family:var(--serif);font-weight:500;font-size:1.15rem;color:var(--gold-deep);margin-bottom:.8rem}
.callout ul{list-style:none;display:flex;flex-direction:column;gap:.6rem}
.callout li{padding-left:1.4rem;position:relative}
.callout li::before{content:"♪";position:absolute;left:0;color:var(--gold)}
/* CTA */
.cta{text-align:center;background:var(--ink);color:var(--ivory);border-radius:20px;padding:2.6rem 1.5rem;margin:3rem 0}
.cta h3{font-family:var(--serif);font-weight:500;font-size:1.3rem;margin-bottom:.6rem}
.cta p{color:#E8DFCE;font-size:.95rem;margin-bottom:1.4rem}
.btn{display:inline-flex;align-items:center;gap:.6em;font-family:var(--sans);font-weight:400;letter-spacing:.12em;font-size:.82rem;text-transform:uppercase;padding:.9em 2.1em;border:1px solid var(--gold);color:#fff;transition:.3s}
.btn:hover{background:var(--gold);color:#fff}
/* 延伸閱讀 + 列表卡 */
.related{margin:2.6rem 0}
.related h3{font-family:var(--serif);font-weight:500;font-size:1.1rem;margin-bottom:1rem;text-align:center;color:var(--gold-deep)}
.post-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.6rem}
.post-card{background:var(--paper);border:1px solid var(--line);border-radius:16px;overflow:hidden;transition:.3s}
.post-card:hover{transform:translateY(-4px);box-shadow:0 12px 30px rgba(0,0,0,.07)}
.post-card img{width:100%;aspect-ratio:16/10;object-fit:cover}
.post-card .pc-body{padding:1.2rem 1.3rem 1.5rem}
.post-card .pc-tag{font-size:.72rem;letter-spacing:.12em;color:var(--gold-deep);text-transform:uppercase}
.post-card h3{font-family:var(--serif);font-weight:500;font-size:1.08rem;line-height:1.5;margin:.5rem 0 .6rem}
.post-card p{font-size:.86rem;color:var(--ink-soft);line-height:1.7}
/* blog 首頁標頭 */
.blog-hero{text-align:center;padding:clamp(2.5rem,6vw,4rem) 0 1rem}
.blog-hero .eyebrow{font-family:var(--display);font-style:italic;color:var(--gold);font-size:1.4rem}
.blog-hero h1{font-family:var(--serif);font-weight:500;font-size:clamp(1.9rem,4.5vw,2.8rem);letter-spacing:.05em;margin:.4rem 0}
.blog-hero p{color:var(--ink-soft);max-width:30em;margin:1rem auto 0}
footer{text-align:center;padding:2.5rem 0;border-top:1px solid var(--line);color:var(--ink-soft);font-size:.82rem}
CSS
```

- [ ] **Step 2: 驗證檔案存在且非空**

Run: `wc -l assets/blog.css`
Expected: 行數 > 60。

- [ ] **Step 3: Commit**

```bash
git add assets/blog.css
git commit -m "feat(blog): 新增部落格共用樣式 blog.css

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 部落格首頁 `blog/index.html`

**Files:**
- Create: `blog/index.html`

首頁含:nav(logo 連回 `/`、右側「← 回首頁」)、blog-hero 標題區、3 張 `.post-card`(連到 3 篇文章,圖用各篇 cover.png)、footer。SEO:title/description/canonical/OG + `Blog` JSON-LD(可選 minimal)。

> 註:此 task 先放好卡片與連結;cover 圖在各文章 task 產出後即生效(路徑先寫好)。

- [ ] **Step 1: 建立 `blog/index.html`**(完整內容)

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aria 老師碎碎念｜長笛・鋼琴學習筆記</title>
<meta name="description" content="聽聽音樂 郭庭羽 Aria 老師的音樂學習專欄,給學生家長與成人學習者的長笛、鋼琴入門筆記:選樂器、練習方法、上課方式與學習心法。">
<link rel="canonical" href="https://tingyumusic.com/blog/">
<meta property="og:type" content="website">
<meta property="og:title" content="Aria 老師碎碎念｜長笛・鋼琴學習筆記">
<meta property="og:description" content="給家長與成人學習者的長笛、鋼琴入門筆記。">
<meta property="og:url" content="https://tingyumusic.com/blog/">
<meta property="og:image" content="https://tingyumusic.com/assets/cover.jpg">
<link rel="icon" href="../assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400&family=Noto+Serif+TC:wght@400;500&family=Noto+Sans+TC:wght@300;400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/blog.css">
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Blog",
  "name":"Aria 老師碎碎念",
  "url":"https://tingyumusic.com/blog/",
  "description":"聽聽音樂 郭庭羽 Aria 老師的長笛・鋼琴學習專欄。",
  "publisher":{"@type":"Organization","name":"聽聽音樂 TingTing Music","url":"https://tingyumusic.com/"}
}
</script>
</head>
<body>
<nav><div class="nav-in">
  <a href="../" class="logo"><span class="em">♪</span> <span><b>TingTing</b> Music</span></a>
  <a href="../" class="nav-back">← 回首頁</a>
</div></nav>
<main class="wrap">
  <header class="blog-hero">
    <div class="eyebrow">Aria's Notes</div>
    <h1>Aria 老師碎碎念</h1>
    <p>給學生家長與成人學習者的長笛・鋼琴學習筆記 —— 從選樂器、練習方法到上課方式,慢慢聊。</p>
  </header>
  <div class="post-list">
    <a class="post-card" href="choosing-first-instrument.html">
      <img src="../assets/blog/choosing-first-instrument/cover.png" alt="孩子在鋼琴與長笛之間挑選的溫暖插畫">
      <div class="pc-body"><span class="pc-tag">給家長</span>
        <h3>怎麼幫孩子挑第一個樂器?鋼琴與長笛的特性比較</h3>
        <p>第一個樂器選鋼琴還是長笛?從年齡、體格與個性,聊聊怎麼挑對入門樂器。</p></div>
    </a>
    <a class="post-card" href="adult-beginner-never-too-late.html">
      <img src="../assets/blog/adult-beginner-never-too-late/cover.png" alt="成人放鬆地學習鋼琴的溫暖插畫">
      <div class="pc-body"><span class="pc-tag">給成人學習者</span>
        <h3>成人零基礎學音樂會太晚嗎?關於年齡的迷思</h3>
        <p>「我這年紀還能學樂器嗎?」聊聊成人學音樂的優勢與常見迷思。</p></div>
    </a>
    <a class="post-card" href="lesson-formats-compared.html">
      <img src="../assets/blog/lesson-formats-compared/cover.png" alt="一對一、團體與線上三種上課方式的溫暖插畫">
      <div class="pc-body"><span class="pc-tag">學習指南</span>
        <h3>一對一、團體班、線上課怎麼選?三種上課方式比較</h3>
        <p>三種上課方式各有優缺點,幫你依目標與個性找到最合適的學習方式。</p></div>
    </a>
  </div>
</main>
<footer>© <span id="y">2026</span> 聽聽音樂 TingTing Music ・ 郭庭羽 Aria Kuo</footer>
<script>document.getElementById('y').textContent=new Date().getFullYear()</script>
</body>
</html>
```

- [ ] **Step 2: 本地驗證頁面與 JSON-LD**

Run:
```bash
pkill -f "http.server 8731" 2>/dev/null; sleep 1
python3 -m http.server 8731 >/tmp/srv.log 2>&1 &
sleep 1
curl -s -o /dev/null -w "blog index: %{http_code}\n" http://localhost:8731/blog/index.html
python3 - <<'PY'
import re,json,urllib.request
h=urllib.request.urlopen('http://localhost:8731/blog/index.html').read().decode()
m=re.search(r'<script type="application/ld\+json">(.*?)</script>',h,re.S)
json.loads(m.group(1)); print("blog JSON-LD: OK")
print("文章卡片數:", h.count('class="post-card"'))
PY
```
Expected: `blog index: 200`、`blog JSON-LD: OK`、`文章卡片數: 3`。

- [ ] **Step 3: Commit**

```bash
git add blog/index.html
git commit -m "feat(blog): 新增部落格首頁 /blog/

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 文章 1 — 怎麼幫孩子挑第一個樂器?

**Files:**
- Create: `blog/choosing-first-instrument.html`
- Create: `assets/blog/choosing-first-instrument/{cover,inline-1,inline-2}.png`

**內容大綱(~1000 字,Aria 第一人稱溫暖口語):**
- 導言:很多家長問「先學什麼樂器好?」,先說沒有標準答案,要看孩子。
- H2「沒有最好的樂器,只有最適合的」:破除「鋼琴一定先學」迷思。
- H2「鋼琴:看得見的音樂地圖」:音感/樂理基礎佳、雙手協調、即看即彈;但需空間與琴。
- H2「長笛:輕巧好攜帶,入門講氣息」:攜帶方便、旋律樂器、社團常見;建議換牙後/8 歲以上、肺活量。
- H2「怎麼從孩子身上找答案」:年齡與體格、個性(坐得住 vs 好動)、家裡條件、孩子被什麼聲音吸引。
- H2「先從一堂體驗課開始」:鼓勵試上、觀察孩子反應,導向預約。

**插畫 prompt(英文,風格基底由腳本附加):**
- cover:`a cheerful child standing between a grand piano and a flute, choosing which to try, cozy music room`
- inline-1:`a happy young child sitting at an upright piano pressing keys, bright living room`
- inline-2:`a child holding a silver flute for the first time, curious and smiling`

- [ ] **Step 1: 產出 3 張插畫**

Run:
```bash
S=assets/blog/choosing-first-instrument
./scripts/gen-illustration.sh "a cheerful child standing between a grand piano and a flute, choosing which to try, cozy music room" $S/cover.png
./scripts/gen-illustration.sh "a happy young child sitting at an upright piano pressing keys, bright living room" $S/inline-1.png
./scripts/gen-illustration.sh "a child holding a silver flute for the first time, curious and smiling" $S/inline-2.png
ls -la $S
```
Expected: 3 個 png,各約 1024×1024。

- [ ] **Step 2: 撰寫文章 HTML**

建立 `blog/choosing-first-instrument.html`,結構如下(把 `{{...}}` 換成依大綱撰寫的 ~1000 字繁中內文,第一人稱、溫暖口語;`H1`/`title`/`description` 用檔頭 metadata 表的值):

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>怎麼幫孩子挑第一個樂器?鋼琴與長笛的特性比較｜Aria 老師碎碎念</title>
<meta name="description" content="孩子想學音樂,第一個樂器選鋼琴還是長笛?Aria 老師從年齡、體格、個性與練習條件,聊聊怎麼幫孩子挑對入門樂器。">
<link rel="canonical" href="https://tingyumusic.com/blog/choosing-first-instrument.html">
<meta property="og:type" content="article">
<meta property="og:title" content="怎麼幫孩子挑第一個樂器?鋼琴與長笛的特性比較">
<meta property="og:description" content="從年齡、體格、個性與練習條件,聊聊怎麼幫孩子挑對入門樂器。">
<meta property="og:url" content="https://tingyumusic.com/blog/choosing-first-instrument.html">
<meta property="og:image" content="https://tingyumusic.com/assets/blog/choosing-first-instrument/cover.png">
<link rel="icon" href="../assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400&family=Noto+Serif+TC:wght@400;500&family=Noto+Sans+TC:wght@300;400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/blog.css">
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Article",
  "headline":"怎麼幫孩子挑第一個樂器?鋼琴與長笛的特性比較",
  "description":"孩子想學音樂,第一個樂器選鋼琴還是長笛?從年齡、體格、個性與練習條件挑對入門樂器。",
  "image":"https://tingyumusic.com/assets/blog/choosing-first-instrument/cover.png",
  "datePublished":"2026-06-09",
  "author":{"@type":"Person","name":"郭庭羽 Aria Kuo","url":"https://tingyumusic.com/#teacher"},
  "publisher":{"@type":"Organization","name":"聽聽音樂 TingTing Music","url":"https://tingyumusic.com/"},
  "mainEntityOfPage":"https://tingyumusic.com/blog/choosing-first-instrument.html"
}
</script>
</head>
<body>
<nav><div class="nav-in">
  <a href="../" class="logo"><span class="em">♪</span> <span><b>TingTing</b> Music</span></a>
  <a href="./" class="nav-back">← Aria 老師碎碎念</a>
</div></nav>
<main class="wrap">
  <div class="crumb"><a href="../">首頁</a> / <a href="./">Aria 老師碎碎念</a> / 怎麼幫孩子挑第一個樂器</div>
  <article class="post">
    <header class="post-head">
      <div class="post-eyebrow">給家長</div>
      <h1>怎麼幫孩子挑第一個樂器?鋼琴與長笛的特性比較</h1>
      <div class="post-meta">2026.06.09 ・ Aria 老師</div>
      <p class="post-lead">{{一句導言:孩子要學音樂,第一個樂器怎麼選?}}</p>
    </header>
    <figure><img src="../assets/blog/choosing-first-instrument/cover.png" alt="孩子在鋼琴與長笛之間挑選樂器的溫暖插畫"></figure>
    <p>{{前言段}}</p>
    <h2>沒有「最好」的樂器,只有「最適合」的</h2>
    <p>{{破除迷思段}}</p>
    <h2>鋼琴:看得見的音樂地圖</h2>
    <p>{{鋼琴特性段}}</p>
    <figure><img src="../assets/blog/choosing-first-instrument/inline-1.png" alt="孩子開心地坐在鋼琴前彈奏的插畫"><figcaption>鋼琴把音高排成一條看得見的線,對建立樂理很有幫助。</figcaption></figure>
    <h2>長笛:輕巧好攜帶,入門講究氣息</h2>
    <p>{{長笛特性段}}</p>
    <figure><img src="../assets/blog/choosing-first-instrument/inline-2.png" alt="孩子第一次拿起長笛、好奇微笑的插畫"></figure>
    <h2>怎麼從孩子身上找答案</h2>
    <p>{{年齡體格個性條件段}}</p>
    <h2>先從一堂體驗課開始</h2>
    <p>{{鼓勵試上段}}</p>
    <div class="callout"><h3>重點整理</h3><ul>
      <li>{{重點1}}</li><li>{{重點2}}</li><li>{{重點3}}</li><li>{{重點4}}</li>
    </ul></div>
    <div class="cta"><h3>想讓孩子試試看?</h3><p>歡迎透過 Line 預約體驗課,我會依孩子的狀況給建議。</p><a class="btn" href="https://line.me/R/ti/p/%40897rgmut" target="_blank" rel="noopener">用 Line 預約諮詢</a></div>
    <div class="related"><h3>延伸閱讀</h3><div class="post-list">
      <a class="post-card" href="adult-beginner-never-too-late.html"><div class="pc-body"><span class="pc-tag">給成人學習者</span><h3>成人零基礎學音樂會太晚嗎?</h3></div></a>
      <a class="post-card" href="lesson-formats-compared.html"><div class="pc-body"><span class="pc-tag">學習指南</span><h3>一對一、團體班、線上課怎麼選?</h3></div></a>
    </div></div>
  </article>
</main>
<footer>© <span id="y">2026</span> 聽聽音樂 TingTing Music ・ 郭庭羽 Aria Kuo</footer>
<script>document.getElementById('y').textContent=new Date().getFullYear()</script>
</body>
</html>
```

- [ ] **Step 3: 驗證頁面、JSON-LD、字數、圖片**

Run:
```bash
python3 - <<'PY'
import re,json,urllib.request
u='http://localhost:8731/blog/choosing-first-instrument.html'
h=urllib.request.urlopen(u).read().decode()
m=re.search(r'<script type="application/ld\+json">(.*?)</script>',h,re.S)
d=json.loads(m.group(1)); assert d['@type']=='Article'; print("Article JSON-LD: OK")
text=re.sub(r'<[^>]+>','',re.search(r'<article.*?</article>',h,re.S).group(0))
zh=len(re.findall(r'[一-鿿]',text)); print("中文字數:",zh)
assert '{{' not in h, "仍有未填的 {{placeholder}}"
print("無殘留 placeholder ✅")
print("圖片數:", h.count('<img'))
PY
```
Expected:`Article JSON-LD: OK`、中文字數 ~800–1100、`無殘留 placeholder ✅`、圖片數 ≥ 3。

- [ ] **Step 4: Commit**

```bash
git add blog/choosing-first-instrument.html assets/blog/choosing-first-instrument/
git commit -m "content(blog): 文章 1 — 怎麼幫孩子挑第一個樂器

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: 文章 5 — 成人零基礎學音樂會太晚嗎?

**Files:**
- Create: `blog/adult-beginner-never-too-late.html`
- Create: `assets/blog/adult-beginner-never-too-late/{cover,inline-1,inline-2}.png`

**內容大綱(~1000 字):**
- 導言:最常被成人學生問的一句「我這年紀還來得及嗎?」
- H2「『太晚』其實是一種迷思」:大腦終身可塑、學音樂沒有年齡上限,舉成人學生例子(去識別化、泛例)。
- H2「大人學音樂的三個隱形優勢」:理解力強、目標明確、自律(會主動練)。
- H2「手指比較硬、記性變差怎麼辦」:用對方法(慢練、分段、放鬆),強調這些是可練的,不是障礙。
- H2「給自己一個對的目標」:不必跟考級小孩比,興趣/紓壓/圓夢都是好目標。
- H2「從今天開始的小步驟」:每天 10–15 分鐘、選喜歡的曲子、找適合大人的老師,導向預約。

**插畫 prompt:**
- cover:`a relaxed adult sitting at a piano enjoying playing, warm evening living room`
- inline-1:`a busy adult practicing flute in the evening after work, calm and focused`
- inline-2:`an adult smiling while reading sheet music, cup of coffee nearby, cozy`

- [ ] **Step 1: 產 3 張插畫**

Run:
```bash
S=assets/blog/adult-beginner-never-too-late
./scripts/gen-illustration.sh "a relaxed adult sitting at a piano enjoying playing, warm evening living room" $S/cover.png
./scripts/gen-illustration.sh "a busy adult practicing flute in the evening after work, calm and focused" $S/inline-1.png
./scripts/gen-illustration.sh "an adult smiling while reading sheet music, cup of coffee nearby, cozy" $S/inline-2.png
ls -la $S
```
Expected: 3 個 png。

- [ ] **Step 2: 撰寫文章 HTML**

複製 Task 4 Step 2 的 HTML 骨架,替換為本篇的:`<title>`/`description`/canonical/OG/JSON-LD(headline、image、mainEntityOfPage 用 `adult-beginner-never-too-late` 路徑)、eyebrow=「給成人學習者」、麵包屑末段=「成人零基礎學音樂會太晚嗎」、3 張圖路徑改 `adult-beginner-never-too-late/`、H1 與 5 個 H2 用本篇大綱、延伸閱讀改連到文章 1 與文章 9。內文依大綱寫 ~1000 字。CTA 文案改:「想為自己開始一件事?歡迎用 Line 聊聊,我會依你的狀況安排適合大人的進度。」

- [ ] **Step 3: 驗證**(同 Task 4 Step 3,網址換成本篇)

Run:
```bash
python3 - <<'PY'
import re,json,urllib.request
u='http://localhost:8731/blog/adult-beginner-never-too-late.html'
h=urllib.request.urlopen(u).read().decode()
d=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',h,re.S).group(1))
assert d['@type']=='Article' and 'adult-beginner' in d['mainEntityOfPage']; print("Article JSON-LD: OK")
zh=len(re.findall(r'[一-鿿]',re.sub(r'<[^>]+>','',re.search(r'<article.*?</article>',h,re.S).group(0))))
assert '{{' not in h; print("無 placeholder ✅ 字數:",zh)
PY
```
Expected:`Article JSON-LD: OK`、`無 placeholder ✅`、字數 ~800–1100。

- [ ] **Step 4: Commit**

```bash
git add blog/adult-beginner-never-too-late.html assets/blog/adult-beginner-never-too-late/
git commit -m "content(blog): 文章 5 — 成人零基礎學音樂會太晚嗎

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: 文章 9 — 一對一、團體班、線上課怎麼選?

**Files:**
- Create: `blog/lesson-formats-compared.html`
- Create: `assets/blog/lesson-formats-compared/{cover,inline-1,inline-2}.png`

**內容大綱(~1000 字):**
- 導言:同樣學樂器,上課方式選對了,學習效果差很多。
- H2「一對一:量身打造、進步最快」:完全依程度調整、即時糾正姿勢;適合想紮實學/檢定比賽。
- H2「團體班:有同伴、氣氛輕鬆」:互相激勵、費用較親民;適合幼兒啟蒙、培養興趣;但進度折衷。
- H2「線上課:彈性高,適合什麼人」:省通勤、時間彈性;適合忙碌成人/外地;需要自備樂器與穩定網路,幼兒較需家長陪。
- H2「怎麼依目標與個性選」:給一個簡單的判斷表(目標/年齡/時間)。
- H2「不確定的話,可以這樣開始」:先一對一打基礎再轉團體、或先體驗課,導向預約。

**插畫 prompt:**
- cover:`three small scenes of music lessons: one-on-one, small group, and online via laptop, cohesive warm composition`
- inline-1:`a teacher giving a one-on-one flute lesson to a student, attentive and warm`
- inline-2:`an adult taking an online music lesson on a laptop at home, piano keyboard in front`

- [ ] **Step 1: 產 3 張插畫**

Run:
```bash
S=assets/blog/lesson-formats-compared
./scripts/gen-illustration.sh "three small scenes of music lessons: one-on-one, small group, and online via laptop, cohesive warm composition" $S/cover.png
./scripts/gen-illustration.sh "a teacher giving a one-on-one flute lesson to a student, attentive and warm" $S/inline-1.png
./scripts/gen-illustration.sh "an adult taking an online music lesson on a laptop at home, piano keyboard in front" $S/inline-2.png
ls -la $S
```
Expected: 3 個 png。

- [ ] **Step 2: 撰寫文章 HTML**

複製 Task 4 骨架,替換本篇 metadata(slug=`lesson-formats-compared`)、eyebrow=「學習指南」、麵包屑、3 圖路徑、H1 + 5 個 H2、延伸閱讀連文章 1 與 5。CTA 文案:「不知道哪種適合你?用 Line 跟我說你的目標與時間,我幫你建議。」內文依大綱 ~1000 字。

- [ ] **Step 3: 驗證**

Run:
```bash
python3 - <<'PY'
import re,json,urllib.request
u='http://localhost:8731/blog/lesson-formats-compared.html'
h=urllib.request.urlopen(u).read().decode()
d=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',h,re.S).group(1))
assert d['@type']=='Article' and 'lesson-formats' in d['mainEntityOfPage']; print("Article JSON-LD: OK")
zh=len(re.findall(r'[一-鿿]',re.sub(r'<[^>]+>','',re.search(r'<article.*?</article>',h,re.S).group(0))))
assert '{{' not in h; print("無 placeholder ✅ 字數:",zh)
PY
```
Expected:`Article JSON-LD: OK`、`無 placeholder ✅`、字數 ~800–1100。

- [ ] **Step 4: Commit**

```bash
git add blog/lesson-formats-compared.html assets/blog/lesson-formats-compared/
git commit -m "content(blog): 文章 9 — 三種上課方式比較

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: 串接主站 — 導覽列連結 + sitemap

**Files:**
- Modify: `index.html`(導覽列)
- Modify: `sitemap.xml`

- [ ] **Step 1: 主站導覽列加「Aria 老師碎碎念」**

在 `index.html` 的 `.nav-links` 中,於「常見問題」之後加一行(連到 `/blog/`):
```html
      <a href="#faq">常見問題</a>
      <a href="blog/">Aria 老師碎碎念</a>
```
(用 Edit 工具:把 `<a href="#faq">常見問題</a>\n    </div>` 換成上面兩行 + `</div>`)

- [ ] **Step 2: sitemap.xml 加入 /blog/ 與 3 篇文章**

把 `sitemap.xml` 的 `</urlset>` 前插入:
```xml
  <url><loc>https://tingyumusic.com/blog/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://tingyumusic.com/blog/choosing-first-instrument.html</loc><changefreq>yearly</changefreq><priority>0.7</priority></url>
  <url><loc>https://tingyumusic.com/blog/adult-beginner-never-too-late.html</loc><changefreq>yearly</changefreq><priority>0.7</priority></url>
  <url><loc>https://tingyumusic.com/blog/lesson-formats-compared.html</loc><changefreq>yearly</changefreq><priority>0.7</priority></url>
```

- [ ] **Step 3: 驗證導覽列與 sitemap 合法**

Run:
```bash
grep -c 'href="blog/">Aria 老師碎碎念' index.html
python3 -c "import xml.dom.minidom,sys; xml.dom.minidom.parse('sitemap.xml'); print('sitemap XML: OK')"
grep -c '/blog/' sitemap.xml
```
Expected:導覽列 1、`sitemap XML: OK`、`/blog/` 出現 4 次。

- [ ] **Step 4: Commit**

```bash
git add index.html sitemap.xml
git commit -m "feat(blog): 主站導覽列連入部落格並更新 sitemap

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: 整體視覺與最終驗收

**Files:** 無(僅驗證)

- [ ] **Step 1: Playwright 截圖三頁 + 首頁**

對 `http://localhost:8731/blog/index.html`、三篇文章、以及主站 `http://localhost:8731/index.html`(確認導覽列新連結)各截一張圖,人工確認:版面沿用米色+金色、插畫正常顯示、無破圖、CTA/延伸閱讀正常。

- [ ] **Step 2: 全站連結與圖片完整性檢查**

Run:
```bash
python3 - <<'PY'
import re,urllib.request
from urllib.parse import urljoin
base='http://localhost:8731/'
pages=['blog/index.html','blog/choosing-first-instrument.html','blog/adult-beginner-never-too-late.html','blog/lesson-formats-compared.html']
bad=[]
for p in pages:
    h=urllib.request.urlopen(base+p).read().decode()
    for src in re.findall(r'<img[^>]+src="([^"]+)"',h):
        if src.startswith('http') and 'tingyumusic.com' not in src:
            continue  # 略過外部圖
        url=urljoin(base+p,src)
        try: urllib.request.urlopen(url).read()
        except Exception as e: bad.append((p,src,str(e)[:60]))
print("壞圖:",bad if bad else "無 ✅")
PY
```
Expected:`壞圖: 無 ✅`。

- [ ] **Step 3: 收尾**

```bash
pkill -f "http.server 8731" 2>/dev/null
echo "完成。所有變更已 commit,未 push(等使用者確認上線)。"
```

---

## 驗收清單(對應 spec 第 9 節)

- [ ] `/blog/` 與 3 篇文章皆可開啟、各有唯一 title/description/canonical
- [ ] 每篇 Article JSON-LD 合法(python 解析通過)
- [ ] 所有插畫產出成功、`<img>` 皆有 alt、無破圖
- [ ] `/blog/` + 3 篇加入 sitemap;主站導覽列「Aria 老師碎碎念」可進入
- [ ] 沿用現有設計、無新建置依賴;主站既有功能不受影響
- [ ] 視覺與主站一致(截圖確認);文字為 Aria 第一人稱溫暖口語
- [ ] 全部 commit、未 push
