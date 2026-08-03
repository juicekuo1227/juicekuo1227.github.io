# 「在台北幫孩子找長笛老師」文章實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 產出部落格第 7 篇文章 `blog/taipei-flute-teacher-guide.html`，這是本站第一篇帶地緣訊號的在地文，用來鞏固「台北長笛老師」這條已在 AI 摘要取得第一順位的查詢。

**Architecture:** 純靜態手寫 HTML，無建置流程。沿用 `blog/choosing-first-instrument.html` 的頁面結構與 `assets/blog.css` 共用樣式；沿用 `blog/kids-wont-practice.html` 已驗證的「編號 H2 清單型」骨架。插畫用 `scripts/gen-illustration.sh` 呼叫 Gemini 產生。文章完成後，同步更新 `blog/index.html`、`sitemap.xml`、`blog/topics.md`，並在 `choosing-first-instrument.html` 補內鏈形成漏斗。

**Tech Stack:** 手寫 HTML5、`assets/blog.css`、JSON-LD（`Article` + `FAQPage`）、`scripts/gen-illustration.sh`（Gemini `gemini-2.5-flash-image`）、`python3` 驗證、`python3 -m http.server` 預覽。

**設計來源：** `docs/superpowers/specs/2026-08-03-taipei-flute-teacher-guide-design.md`

## Global Constraints

以下規則適用於每一個 Task，不再重複列出。

- **只 commit，不 push。** push 等於上線，只在使用者明確要求時做。
- commit 訊息結尾加 `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`
- **中文內文一律全形標點**（，。：？！）。半形只允許出現在 JSON-LD、CSS、URL、程式碼、以及數字與英文之間。
- **不得對標點做全檔 `sed`** —— 會破壞 JSON-LD 與 URL 裡的半形符號。
- **單段上限約 120 字**（手機 375px 約 5~6 行）。punch 短句可獨立成段。
- **句子長短落差要大**：長句鋪陳後接一個 2~5 字的短句。避免兩個等長並排子句。
- **不放 `datePublished`**，`post-meta` 只寫「Aria 老師」。
- 口吻：朋友聊天、第二人稱「你」、帶 Aria 第一人稱視角、幾乎不用 emoji、不誇大、**不寫死價格**（引導 Line 預約）。
- **標題與內文不使用「我會先看」這類第一人稱主導句式** —— 焦點要放在讀者的判斷標準，不是老師本人。
- 地緣資訊只出現三處：`<title>`/`<h1>`、重點一的接送成本段、CTA 附近。**不得額外增加。**
- 文章定稿標題：`在台北幫孩子找長笛老師，這 5 件事比學歷重要`
- `<title>` 後綴：`｜Aria 老師碎碎念`
- Line 連結一律用：`https://line.me/R/ti/p/%40897rgmut`

---

### Task 1: 產生三張插畫

**Files:**
- Create: `assets/blog/taipei-flute-teacher-guide/cover.png`
- Create: `assets/blog/taipei-flute-teacher-guide/inline-1.png`
- Create: `assets/blog/taipei-flute-teacher-guide/inline-2.png`

**Interfaces:**
- Consumes: `scripts/gen-illustration.sh`（已存在），需環境變數 `GEMINI_API_KEY`（使用者已設定）
- Produces: 三個 PNG 路徑，Task 2~5 的 `<img src>` 與 `og:image` 會引用

**Note:** 腳本會自動接上共用風格字串（flat illustration, pastel colors, no text）並自動建立目錄，指令只需給主體描述。

- [ ] **Step 1: 確認前置條件**

```bash
command -v jq >/dev/null && echo "jq OK"
test -n "${GEMINI_API_KEY:-}" && echo "GEMINI_API_KEY OK"
```

Expected: 兩行都印出 OK。若 `GEMINI_API_KEY` 未設定，停下來問使用者，不要繼續。

- [ ] **Step 2: 產生封面圖**

```bash
scripts/gen-illustration.sh \
  "a parent and a child looking at a silver flute together in a warm music studio, the child curious and smiling" \
  assets/blog/taipei-flute-teacher-guide/cover.png
```

Expected: 印出 `✅ 產出 assets/blog/taipei-flute-teacher-guide/cover.png`

- [ ] **Step 3: 產生內文圖 1（用於重點三・氣息）**

```bash
scripts/gen-illustration.sh \
  "a child learning breath control with a flute while a teacher guides gently beside them in a music room" \
  assets/blog/taipei-flute-teacher-guide/inline-1.png
```

Expected: 印出 `✅ 產出 …/inline-1.png`

- [ ] **Step 4: 產生內文圖 2（用於重點四・旁聽）**

```bash
scripts/gen-illustration.sh \
  "a parent sitting quietly on a chair at the back of a music room, watching a child take a flute lesson" \
  assets/blog/taipei-flute-teacher-guide/inline-2.png
```

Expected: 印出 `✅ 產出 …/inline-2.png`

- [ ] **Step 5: 驗證三張圖都是 1024×1024 的有效 PNG**

```bash
for f in cover inline-1 inline-2; do
  printf "%-10s " "$f"
  sips -g pixelWidth -g pixelHeight "assets/blog/taipei-flute-teacher-guide/$f.png" 2>/dev/null \
    | awk '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{print w"x"h}'
done
```

Expected: 三行都是 `1024x1024`。若某張構圖不理想或含文字，重跑該張的指令（Gemini 每次結果不同）。

- [ ] **Step 6: Commit**

```bash
git add assets/blog/taipei-flute-teacher-guide/
git commit -m "$(cat <<'EOF'
assets(blog): 新增台北長笛老師篇插畫三張

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: 建立 `<head>` 與 JSON-LD

**Files:**
- Create: `blog/taipei-flute-teacher-guide.html`

**Interfaces:**
- Consumes: Task 1 產出的 `cover.png`（供 `og:image` 與 JSON-LD `image` 使用）
- Produces: 檔案的 `<head>` 區塊與兩組 JSON-LD。**Task 5 的 FAQ HTML 必須與此處 `FAQPage` 的四題逐字一致**

**Note:** 完整照抄 `blog/choosing-first-instrument.html` 第 1~44 行的結構（同一組字體 URL、同一支 `blog.css`、同一個 favicon），只替換文字內容。`FAQPage` 的四題答案在下方已定稿，不得改寫。

- [ ] **Step 1: 建立檔案並寫入 `<head>`**

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>在台北幫孩子找長笛老師，這 5 件事比學歷重要｜Aria 老師碎碎念</title>
<meta name="description" content="孩子想學長笛，台北的老師名單卻長得看不完？Aria 老師聊挑長笛老師該看的 5 件事：距離、能不能先試上、氣息怎麼教、家長能不能旁聽，還有檢定經驗怎麼問。">
<link rel="canonical" href="https://tingyumusic.com/blog/taipei-flute-teacher-guide.html">
<meta property="og:type" content="article">
<meta property="og:title" content="在台北幫孩子找長笛老師，這 5 件事比學歷重要">
<meta property="og:description" content="挑長笛老師最該看的不是學歷，是孩子上不上得下去。五個具體的判斷點。">
<meta property="og:url" content="https://tingyumusic.com/blog/taipei-flute-teacher-guide.html">
<meta property="og:image" content="https://tingyumusic.com/assets/blog/taipei-flute-teacher-guide/cover.png">
<link rel="icon" href="../assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400&family=Noto+Serif+TC:wght@400;500&family=Noto+Sans+TC:wght@300;400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/blog.css">
```

- [ ] **Step 2: 接著寫入 JSON-LD 與 `</head>`**

```html
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@graph":[
  {
    "@type":"Article",
    "headline":"在台北幫孩子找長笛老師，這 5 件事比學歷重要",
    "description":"挑長笛老師最該看的不是學歷，是孩子上不上得下去。從距離、試上、氣息教法、家長旁聽到檢定經驗，五個具體的判斷點。",
    "image":"https://tingyumusic.com/assets/blog/taipei-flute-teacher-guide/cover.png",
    "author":{"@type":"Person","name":"郭庭羽 Aria Kuo","url":"https://tingyumusic.com/#teacher"},
    "publisher":{"@type":"Organization","name":"聽聽音樂 TingTing Music","url":"https://tingyumusic.com/"},
    "mainEntityOfPage":"https://tingyumusic.com/blog/taipei-flute-teacher-guide.html"
  },
  {
    "@type":"FAQPage",
    "mainEntity":[
      {"@type":"Question","name":"孩子幾歲可以開始學長笛？","acceptedAnswer":{"@type":"Answer","text":"通常建議換完牙、大約八歲以上再開始。這時門牙位置穩定，肺活量也成熟一些，吹出穩定的聲音會比較不吃力。早一點不是不行，只是會比較辛苦。"}},
      {"@type":"Question","name":"學長笛一定要先買一支長笛嗎？","acceptedAnswer":{"@type":"Answer","text":"不必。入門階段可以先用租的，或先跟老師借用，等孩子的興趣撐過前幾個月、確定想繼續學，再考慮買一支自己的。把錢留到那時候花，比較不會浪費。"}},
      {"@type":"Question","name":"長笛課一週上幾次比較好？","acceptedAnswer":{"@type":"Answer","text":"初學一週一次就夠了。真正決定進度的不是上課次數，而是課與課之間有沒有拿起來吹。與其一週跑兩趟卻都沒練，不如一週一次、每天在家吹十分鐘。"}},
      {"@type":"Question","name":"學長笛一定要考檢定嗎？","acceptedAnswer":{"@type":"Answer","text":"不一定。檢定是工具，不是目的。如果孩子需要一個看得見的階段性目標，它很好用；如果他練得開心、也持續在進步，不考也完全沒關係。"}}
    ]
  }
  ]
}
</script>
</head>
```

- [ ] **Step 3: 驗證 JSON-LD 是合法 JSON 且不含 `datePublished`**

```bash
python3 - <<'EOF'
import re, json, sys
html = open('blog/taipei-flute-teacher-guide.html', encoding='utf-8').read()
m = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
assert m, "找不到 JSON-LD"
data = json.loads(m.group(1))
types = [n['@type'] for n in data['@graph']]
assert types == ['Article', 'FAQPage'], types
assert 'datePublished' not in m.group(1), "不該出現 datePublished"
assert len(data['@graph'][1]['mainEntity']) == 4, "FAQ 應為 4 題"
print("JSON-LD OK:", types)
EOF
```

Expected: `JSON-LD OK: ['Article', 'FAQPage']`

- [ ] **Step 4: Commit**

```bash
git add blog/taipei-flute-teacher-guide.html
git commit -m "$(cat <<'EOF'
seo(blog): 台北長笛老師篇 head 與 JSON-LD

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: 開場、結論框、重點一與重點二

**Files:**
- Modify: `blog/taipei-flute-teacher-guide.html`（接在 `</head>` 之後）

**Interfaces:**
- Consumes: Task 2 的 `<head>`、Task 1 的 `cover.png`
- Produces: `<body>`、`<nav>`、`<main class="wrap">`、`<article class="post">` 三層容器（Task 4、5 會繼續往內加，**不要在此關閉 `</article>`／`</main>`／`</body>`**）

**Note:** `nav`、`crumb`、`post-head` 完全照抄 `choosing-first-instrument.html` 第 46~58 行的結構，只換文字。

- [ ] **Step 1: 寫入 nav、麵包屑、文章標頭與結論框**

```html
<body>
<nav><div class="nav-in">
  <a href="../" class="logo"><span class="em">♪</span> <span><b>TingTing</b> Music</span></a>
  <a href="./" class="nav-back">← Aria 老師碎碎念</a>
</div></nav>
<main class="wrap">
  <div class="crumb"><a href="../">首頁</a> / <a href="./">Aria 老師碎碎念</a> / 在台北幫孩子找長笛老師</div>
  <article class="post">
    <header class="post-head">
      <div class="post-eyebrow">給家長</div>
      <h1>在台北幫孩子找長笛老師，這 5 件事比學歷重要</h1>
      <div class="post-meta">Aria 老師</div>
      <p class="post-lead">名單很長，判斷標準卻很少。挑老師之前，先把這幾件事看清楚。</p>
    </header>
    <div class="answer">
      <span class="a-label">先講結論</span>
      <p>挑長笛老師，最該看的其實不是學歷，是<strong>這個老師能不能讓你的孩子上得下去</strong>。</p>
      <p>具體有五件事：離家的距離、能不能先上一堂再決定、老師怎麼教氣息、家長能不能旁聽，還有打算考檢定的話，老師實際帶過幾個。學歷當然有用，但它排在這五件事後面。</p>
    </div>
```

- [ ] **Step 2: 寫入 hook 開場**

hook 必須放在最前面，情境交代放後面。第一句自然帶出「台北 長笛老師」這組目標關鍵字（那本來就是讀者剛打進搜尋框的字，不是硬塞）。

```html
    <figure><img src="../assets/blog/taipei-flute-teacher-guide/cover.png" alt="家長和孩子一起看著一支長笛、孩子好奇微笑的插畫"></figure>
    <p>打開 Google 搜「台北 長笛老師」，跳出一長串名字。音樂系畢業、得過獎、教學經驗豐富——每一個看起來都很好。</p>
    <p>看完之後，你反而更不知道要選誰了。</p>
    <p>我懂。名單很長，判斷標準卻很少。</p>
    <p>通常會走到這一步，是因為孩子某天突然開口說想學長笛。可能是在學校聽到的，也可能是在影片裡看到的，總之他記住了那個聲音，然後跑來跟你說。</p>
    <p>那你要做的第一件事，其實不是買一支長笛。這點我另外寫過，可以先看<a class="inlink" href="beginner-gear-guide.html">初學要準備什麼</a>——先租、先借都行，等興趣撐過前幾個月再說。</p>
    <p>先找到對的人。剩下的再說。</p>
```

- [ ] **Step 3: 寫入重點一（語氣放軟版）**

**這段是唯一在內文帶地緣的地方**，講的是通用原則（接送成本、捷運動線），**不得指名自己的教室**。語氣要放軟：承認確實有值得跑遠路的老師。

```html
    <h2>重點一：老師離家近不近，比你想的更重要</h2>
    <p>我知道這聽起來很不浪漫。找老師欸，怎麼會先看距離？</p>
    <p>但你算算看。一週一次，一次來回可能要一小時，這件事要走兩年、三年。頭三個月大家都很有熱情，撐得住；真正會磨掉一個孩子學琴熱情的，往往不是課本身，是那段路。</p>
    <p>我看過太多次了。課上得好好的，最後停下來的理由是「最近實在跑不動」。</p>
    <p>當然，也真的有值得跑遠一點的老師——如果那個人特別適合你的孩子，多花二十分鐘是值得的。我不想把話說死。</p>
    <p>只是請你在決定之前，把接送這件事先算進去：誰接、幾點、下課之後還要不要趕晚餐。捷運沿線、或者接送動線順的地方，能省下的力氣比你想像的多。這些現實條件撐不撐得住，比老師的頭銜更早決定結果。</p>
```

- [ ] **Step 4: 寫入重點二**

```html
    <h2>重點二：先上一堂再決定，不要一次買一季</h2>
    <p>很多家長問我的第一句話是「一期幾堂、多少錢」。我通常會先擋一下——那是後面的事。</p>
    <p>先上一堂。真的。</p>
    <p>孩子跟老師合不合，不是看資歷表能看出來的，得讓他們待在同一個空間裡四十分鐘才知道。而且一個願意讓你先試一堂的老師，本身就透露了訊息：他有把握，也不急著把你綁住。</p>
    <p>試上那天，你可以順便觀察這幾件事：</p>
    <ul class="dash">
      <li>老師有沒有先問孩子問題，而不是一開場就介紹自己。</li>
      <li>孩子走出教室的時候，是累的，還是眼睛亮的。</li>
      <li>老師有沒有告訴你他打算怎麼開始，而不是只回一句「沒問題」。</li>
    </ul>
    <p>這三件事，比任何介紹都準。</p>
```

- [ ] **Step 5: 本機預覽確認版型正常**

```bash
python3 -m http.server 8731 >/dev/null 2>&1 &
sleep 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8731/blog/taipei-flute-teacher-guide.html
```

Expected: `200`。用瀏覽器開 `http://localhost:8731/blog/taipei-flute-teacher-guide.html`，確認字體、結論框、封面圖都正常顯示（此時文章尚未收尾，頁面下半截斷屬正常）。確認後結束伺服器：`kill %1`

- [ ] **Step 6: Commit**

```bash
git add blog/taipei-flute-teacher-guide.html
git commit -m "$(cat <<'EOF'
content(blog): 台北長笛老師篇 開場與重點一、二

hook 放在最前面(讀者剛搜完就落地),情境交代放後面。
重點一語氣放軟,承認有值得跑遠路的老師。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 重點三、四、五與收尾段

**Files:**
- Modify: `blog/taipei-flute-teacher-guide.html`

**Interfaces:**
- Consumes: Task 3 未關閉的 `<article class="post">`、Task 1 的 `inline-1.png` 與 `inline-2.png`
- Produces: 五個編號 H2 全部到齊，加一個非編號收尾 H2（**仍不關閉 `</article>`**）

**Note:** 重點三是全篇專業展示區。下方為草稿，**必須在 commit 訊息與交付說明中標記為「待 Aria 校訂」**，不得當成定稿對外宣稱。

- [ ] **Step 1: 寫入重點三（氣息・草稿，待 Aria 校訂）**

```html
    <figure><img src="../assets/blog/taipei-flute-teacher-guide/inline-1.png" alt="老師在一旁引導孩子練習長笛氣息的插畫"><figcaption>長笛的門檻不在手指，在你看不見的地方。</figcaption></figure>
    <h2>重點三：問問老師，怎麼教長笛的「氣息」</h2>
    <p>如果五件事裡只能問一件，我會請你問這個。</p>
    <p>長笛跟鋼琴很不一樣。鋼琴按下去就有聲音，長笛不是——它得先有一道穩定的氣，聲音才站得起來。孩子剛開始最常遇到的挫折，不是手指按不到，是吹了半天只有風聲。</p>
    <p>所以一個長笛老師怎麼處理「氣」，幾乎決定了孩子前三個月會不會放棄。</p>
    <p>你可以直接問：孩子一開始吹不出聲音，你都怎麼帶？</p>
    <p>會教的老師，答案通常很具體。他會講怎麼先不裝笛頭以外的部分、怎麼用吹瓶口的方式找到那個角度、怎麼讓孩子感覺到氣從哪裡出來。他也會提到嘴型和呼吸要分開練，不會混在一起講。</p>
    <p>答得含糊的，多半是「多練就會了」。那句話沒有錯，但它不是教法。</p>
```

- [ ] **Step 2: 寫入重點四**

```html
    <figure><img src="../assets/blog/taipei-flute-teacher-guide/inline-2.png" alt="家長安靜地坐在教室後方，看著孩子上長笛課的插畫"></figure>
    <h2>重點四：家長能不能旁聽？課後有沒有回饋？</h2>
    <p>這題很多家長不好意思問，怕顯得不信任老師。但它其實很重要。</p>
    <p>孩子回家要練的是課堂上那四十分鐘的東西。如果你完全不知道課裡發生了什麼，回家想幫忙也使不上力，最後只剩下一句「你去練琴」。那句話幫不了他。</p>
    <p>所以我會建議你確認三件事：</p>
    <ul class="dash">
      <li>老師願不願意讓你在後面坐著，或至少偶爾旁聽一次。</li>
      <li>課後有沒有一兩句話，告訴你這週要練什麼、哪裡要注意。</li>
      <li>你提問的時候，老師是真的回答，還是打太極。</li>
    </ul>
    <p>不必每堂都聽。知道方向就夠了。</p>
```

- [ ] **Step 3: 寫入重點五**

這是全篇**唯一**提到 Aria 自己經驗的地方，且只以「檢定」為限（比賽經驗很少，不得寫成強項）。

```html
    <h2>重點五：打算考檢定，就問老師實際帶過幾個</h2>
    <p>先說清楚：檢定不是必要的。孩子練得開心、也一直在進步，不考完全沒問題。</p>
    <p>但如果你確實想讓孩子有個階段性目標，那這題就要問。</p>
    <p>帶過檢定的老師，會知道很多在課本上看不到的事——各級的曲目怎麼配才不會太趕、音階和視奏要提前多久開始練、考場當天孩子容易在哪裡卡住。這些是經驗，不是資歷。</p>
    <p>問法很簡單：這幾年你帶過幾個孩子考？大概都考到第幾級？</p>
    <p>答得出來的，就是真的帶過。</p>
```

- [ ] **Step 4: 寫入收尾 H2（非編號）**

照 `kids-wont-practice.html` 的收法：最後一個 H2 不編號，用來收束並鋪向行動。

```html
    <h2>那，第一堂長笛課會發生什麼？</h2>
    <p>講了五件事，你可能還是有點緊張。畢竟要帶孩子去見一個陌生人。</p>
    <p>其實第一堂通常很輕鬆。我會先跟孩子聊幾句，問他為什麼想學長笛、在哪裡聽到的，然後讓他把笛頭拿起來試著吹吹看。多數孩子第一次都吹不出來，那很正常，我們會一起找那個角度。</p>
    <p>吹出第一個聲音的時候，孩子的表情會告訴你答案。那個反應騙不了人。</p>
    <p>看完這五件事，你心裡大概已經有個底了。剩下的，就是帶他去試一次。</p>
```

- [ ] **Step 5: 檢查全形標點與段落長度**

```bash
python3 - <<'EOF'
import re
html = open('blog/taipei-flute-teacher-guide.html', encoding='utf-8').read()
body = html.split('</head>', 1)[1]
# 抓出中文相鄰的半形標點(排除數字/英文之間的用法)
bad = re.findall(r'[一-鿿][,;:?!][一-鿿]', body)
print("半形標點問題:", bad if bad else "無")
# 段落長度
for i, p in enumerate(re.findall(r'<p[^>]*>(.*?)</p>', body, re.S), 1):
    text = re.sub(r'<[^>]+>', '', p).strip()
    if len(text) > 120:
        print(f"  第 {i} 段過長: {len(text)} 字 — {text[:30]}…")
print("段落長度檢查完成")
EOF
```

Expected: `半形標點問題: 無`，且沒有任何「過長」行。若有過長段落，在情緒或論點轉折處切開，不要逐句斷行。

- [ ] **Step 6: Commit**

```bash
git add blog/taipei-flute-teacher-guide.html
git commit -m "$(cat <<'EOF'
content(blog): 台北長笛老師篇 重點三~五與收尾

重點三(氣息教法)為草稿,待 Aria 校訂成實際教法後才算定稿。
重點五只寫檢定經驗,不寫比賽(實際比賽指導經驗很少)。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: FAQ、快速重點、CTA 與延伸閱讀

**Files:**
- Modify: `blog/taipei-flute-teacher-guide.html`

**Interfaces:**
- Consumes: Task 2 的 `FAQPage` JSON-LD（**四題文字必須逐字一致**）、Task 4 結束時仍開啟的 `<article class="post">`
- Produces: 完整收尾的 HTML 檔（關閉 `</article>`、`</main>`，加上 `<footer>` 與年份 script）

- [ ] **Step 1: 寫入 FAQ 區塊**

四題的問句與答案文字，必須與 Task 2 的 `FAQPage` JSON-LD 完全相同。

```html
    <section class="faq">
      <h2>常見問題</h2>
      <h3 class="faq-q">孩子幾歲可以開始學長笛？</h3>
      <p class="faq-a">通常建議換完牙、大約八歲以上再開始。這時門牙位置穩定，肺活量也成熟一些，吹出穩定的聲音會比較不吃力。早一點不是不行，只是會比較辛苦。</p>
      <h3 class="faq-q">學長笛一定要先買一支長笛嗎？</h3>
      <p class="faq-a">不必。入門階段可以先用租的，或先跟老師借用，等孩子的興趣撐過前幾個月、確定想繼續學，再考慮買一支自己的。把錢留到那時候花，比較不會浪費。</p>
      <h3 class="faq-q">長笛課一週上幾次比較好？</h3>
      <p class="faq-a">初學一週一次就夠了。真正決定進度的不是上課次數，而是課與課之間有沒有拿起來吹。與其一週跑兩趟卻都沒練，不如一週一次、每天在家吹十分鐘。</p>
      <h3 class="faq-q">學長笛一定要考檢定嗎？</h3>
      <p class="faq-a">不一定。檢定是工具，不是目的。如果孩子需要一個看得見的階段性目標，它很好用；如果他練得開心、也持續在進步，不考也完全沒關係。</p>
    </section>
```

- [ ] **Step 2: 寫入快速重點、CTA 與延伸閱讀**

CTA 是**唯一**可以寫出具體教室位置的地方（地緣三處中的第三處）。

```html
    <div class="callout"><h3>快速重點</h3><ul>
      <li>距離要撐得住——一週一次、要走上兩三年，接送成本先算進去。</li>
      <li>先上一堂再決定，不要一次買一季。</li>
      <li>問老師怎麼教氣息，這題最能分辨真懂還是含糊。</li>
      <li>確認家長能不能旁聽、課後有沒有回饋。</li>
      <li>打算考檢定的話，直接問老師實際帶過幾個。</li>
    </ul></div>
    <div class="cta"><h3>想讓孩子先試一堂嗎？</h3><p>我的教室在台北市中山區，捷運行天宮站步行 4 分鐘。歡迎用 Line 跟我聊聊孩子的狀況，我們先安排一堂看看。</p><a class="btn" href="https://line.me/R/ti/p/%40897rgmut" target="_blank" rel="noopener">用 Line 預約諮詢</a></div>
    <div class="related"><h3>延伸閱讀</h3><div class="post-list">
      <a class="post-card" href="choosing-first-instrument.html"><div class="pc-body"><span class="pc-tag">給家長</span><h3>怎麼幫孩子挑第一個樂器？鋼琴與長笛的特性比較</h3></div></a>
      <a class="post-card" href="beginner-gear-guide.html"><div class="pc-body"><span class="pc-tag">入門基礎</span><h3>初學要準備什麼？電鋼琴、租琴與基本配件怎麼選</h3></div></a>
    </div></div>
  </article>
</main>
<footer>© <span id="y">2026</span> 聽聽音樂 TingTing Music ・ 郭庭羽 Aria Kuo</footer>
<script>document.getElementById('y').textContent=new Date().getFullYear()</script>
</body>
</html>
```

- [ ] **Step 3: 驗證 FAQ HTML 與 JSON-LD 逐字一致**

```bash
python3 - <<'EOF'
import re, json
html = open('blog/taipei-flute-teacher-guide.html', encoding='utf-8').read()
ld = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S).group(1))
faq = ld['@graph'][1]['mainEntity']
qs = re.findall(r'<h3 class="faq-q">(.*?)</h3>', html)
as_ = re.findall(r'<p class="faq-a">(.*?)</p>', html, re.S)
assert len(qs) == len(as_) == 4, f"HTML FAQ 數量錯誤 q={len(qs)} a={len(as_)}"
for i, item in enumerate(faq):
    assert item['name'] == qs[i], f"第{i+1}題問句不一致:\n LD: {item['name']}\n HTML: {qs[i]}"
    assert item['acceptedAnswer']['text'] == as_[i].strip(), f"第{i+1}題答案不一致:\n LD: {item['acceptedAnswer']['text']}\n HTML: {as_[i].strip()}"
print("FAQ 四題 HTML 與 JSON-LD 完全一致")
EOF
```

Expected: `FAQ 四題 HTML 與 JSON-LD 完全一致`

- [ ] **Step 4: 驗證地緣資訊只出現在規定的三處**

```bash
python3 - <<'EOF'
import re
html = open('blog/taipei-flute-teacher-guide.html', encoding='utf-8').read()
for kw in ['行天宮', '中山區']:
    print(f"{kw}: 出現 {html.count(kw)} 次")
body = html.split('</head>',1)[1]
print("內文(body)中 行天宮:", body.count('行天宮'), "— 應為 1(只在 CTA)")
print("內文(body)中 中山區:", body.count('中山區'), "— 應為 1(只在 CTA)")
EOF
```

Expected: body 內 `行天宮` 與 `中山區` 各只出現 1 次（都在 CTA）。若超過，刪掉多餘的——地緣密度是刻意壓低的設計。

- [ ] **Step 5: Commit**

```bash
git add blog/taipei-flute-teacher-guide.html
git commit -m "$(cat <<'EOF'
content(blog): 台北長笛老師篇 FAQ、快速重點與 CTA

FAQ 四題與 head 的 FAQPage JSON-LD 逐字一致。
教室位置只在 CTA 出現一次(地緣三處之三)。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: 站台整合與最終驗收

**Files:**
- Modify: `blog/index.html:41`（在 `<div class="post-list">` 之後插入新卡片，成為第一張）
- Modify: `sitemap.xml`（在 `beginner-gear-guide` 那行之後新增一筆）
- Modify: `blog/topics.md`（新增「在地主題」區塊）
- Modify: `blog/choosing-first-instrument.html:92`（在長笛段落末尾補內鏈）

**Interfaces:**
- Consumes: Task 1~5 完成的文章與插畫
- Produces: 全站可從三個入口（部落格首頁卡片、sitemap、既有文章內鏈）觸及新文章

**Note:** 新卡片放在 `post-list` 的**第一張**，因為這是目前 SEO 主推的文章。`sitemap.xml` 的文章列採單行緊湊格式（`changefreq=yearly`、`priority=0.7`），照既有格式寫。

- [ ] **Step 1: 在 `blog/index.html` 插入卡片**

在 `<div class="post-list">` 這一行的正下方，插入這張卡片（成為列表第一張）：

```html
    <a class="post-card" href="taipei-flute-teacher-guide.html">
      <img src="../assets/blog/taipei-flute-teacher-guide/cover.png" alt="家長和孩子一起看著一支長笛、孩子好奇微笑的插畫">
      <div class="pc-body"><span class="pc-tag">給家長</span>
        <h3>在台北幫孩子找長笛老師，這 5 件事比學歷重要</h3>
        <p>名單很長，判斷標準卻很少。距離、試上、氣息教法、旁聽與檢定經驗，一件一件看。</p></div>
    </a>
```

- [ ] **Step 2: 在 `sitemap.xml` 新增一筆**

在 `beginner-gear-guide.html` 那一行之後、`</urlset>` 之前插入：

```xml
  <url><loc>https://tingyumusic.com/blog/taipei-flute-teacher-guide.html</loc><changefreq>yearly</changefreq><priority>0.7</priority></url>
```

- [ ] **Step 3: 在 `blog/topics.md` 末尾新增「在地主題」區塊**

這篇不在原本的十篇清單內，另立區塊：

```markdown

## 在地主題
- [x] 11. 在台北幫孩子找長笛老師，這 5 件事比學歷重要 — 已完成（`taipei-flute-teacher-guide.html`）
```

- [ ] **Step 4: 在 `choosing-first-instrument.html` 補內鏈**

找到第 92 行 `<p>早一點不是不行。只是會比較辛苦。</p>`，在它的正下方插入一段：

```html
    <p>如果已經確定要學長笛，接下來就是找老師了。這部分我另外寫了一篇<a class="inlink" href="taipei-flute-teacher-guide.html">在台北幫孩子找長笛老師該看的 5 件事</a>，可以接著看。</p>
```

- [ ] **Step 5: 驗證 sitemap 合法且包含新 URL**

```bash
python3 - <<'EOF'
import xml.etree.ElementTree as ET
t = ET.parse('sitemap.xml')
ns = {'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
locs = [e.text for e in t.getroot().iterfind('.//s:loc', ns)]
assert 'https://tingyumusic.com/blog/taipei-flute-teacher-guide.html' in locs, "sitemap 缺新 URL"
print(f"sitemap OK，共 {len(locs)} 筆")
EOF
```

Expected: `sitemap OK，共 9 筆`

- [ ] **Step 6: 驗證三個入口都連得到新文章**

```bash
grep -c 'taipei-flute-teacher-guide' blog/index.html sitemap.xml blog/choosing-first-instrument.html blog/topics.md
```

Expected: 四個檔案各至少 1（`index.html` 為 2，因為 href 與 img 路徑各一次）。

- [ ] **Step 7: 全檔複驗標點與段落長度**

Task 4 Step 5 只檢查到重點五為止；Task 5 之後又新增了 FAQ、快速重點與 CTA 的中文內容，這裡對**完整檔案**再跑一次。

```bash
python3 - <<'EOF'
import re
html = open('blog/taipei-flute-teacher-guide.html', encoding='utf-8').read()
body = html.split('</head>', 1)[1]
bad = re.findall(r'[一-鿿][,;:?!][一-鿿]', body)
print("半形標點問題:", bad if bad else "無")
paras = re.findall(r'<p[^>]*>(.*?)</p>', body, re.S)
over = []
for p in paras:
    text = re.sub(r'<[^>]+>', '', p).strip()
    if len(text) > 120:
        over.append((len(text), text[:30]))
for n, t in over:
    print(f"  過長段落 {n} 字 — {t}…")
print(f"共 {len(paras)} 段，過長 {len(over)} 段")
EOF
```

Expected: `半形標點問題: 無`，且 `過長 0 段`。

- [ ] **Step 8: 本機預覽做最終目視確認**

```bash
python3 -m http.server 8731 >/dev/null 2>&1 &
sleep 1
for u in / /blog/ /blog/taipei-flute-teacher-guide.html /blog/choosing-first-instrument.html; do
  printf "%-45s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8731$u)"
done
```

Expected: 四個路徑都是 `200`。

接著用瀏覽器開 `http://localhost:8731/blog/taipei-flute-teacher-guide.html`，逐項確認：
- 三張插畫都載入（無破圖）
- 結論框、五個編號 H2、FAQ、快速重點、CTA 依序出現
- Line 按鈕點下去會開啟 `line.me`
- 「初學要準備什麼」與延伸閱讀的兩張卡片都連得到
- 手機寬度（DevTools 375px）下段落不會過長、不會橫向捲動

確認後結束伺服器：`kill %1`

- [ ] **Step 9: Commit**

```bash
git add blog/index.html sitemap.xml blog/topics.md blog/choosing-first-instrument.html
git commit -m "$(cat <<'EOF'
seo(blog): 台北長笛老師篇上架(卡片/sitemap/topics/內鏈)

卡片放 post-list 第一張(目前 SEO 主推)。
choosing-first-instrument 補內鏈,形成「選樂器→找老師→Line」漏斗。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## 交付後待辦（不在本計畫範圍）

1. **重點三（氣息教法）需 Aria 校訂** —— 草稿依一般長笛教學常識寫成，須改為實際教法後才算定稿。
2. **未 push。** 全部 commit 完成後提醒使用者：push 即上線，需其明確指示。
3. 上線後在 Google Search Console 對新 URL 提出索引要求。
