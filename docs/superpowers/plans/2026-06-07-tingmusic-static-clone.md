# 聽聽音樂 靜態網站復刻 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 https://tingmusic.mystrikingly.com/ 復刻成可獨立部署的純靜態 RWD 網站，並把底部聯絡表單改成 `mailto:` 寄送。

**Architecture:** Vanilla HTML/CSS/JS 分檔（`index.html` / `style.css` / `script.js`），圖片全部下載到本地 `assets/`，4 部 YouTube 以 `<iframe>` 嵌入。無框架、無建置、無後端。聯絡表單由 `script.js` 攔截送出、組 `mailto:` 連結開啟使用者郵件軟體。

**Tech Stack:** HTML5、CSS3（Grid/Flexbox + media queries）、原生 ES6 JS、Google Fonts（Averia Sans Libre）。驗證用 Playwright MCP 開本機檔案檢查。

> **驗證方式說明**：本專案無單元測試框架。每個區塊任務的「驗證」= 用 Playwright MCP `browser_navigate` 開啟本機 `index.html`（`file://` 路徑）+ `browser_snapshot` / `browser_take_screenshot` 檢查渲染與 console error。聯絡表單以 `browser_evaluate` 驗證組出的 `mailto:` 字串。

---

## 檔案結構

```
tingyumusic/
├─ index.html        # 語意化結構，9 區塊
├─ style.css         # :root token + 各區塊樣式 + RWD
├─ script.js         # initMobileMenu / initContactForm / initSmoothScroll
└─ assets/           # 下載的本地圖片
   ├─ logo.png, hero.jpg, teacher.png
   ├─ icon-1.png ~ icon-5.png
   └─ gallery-01.jpg ~ gallery-12.jpg
```

絕對路徑前綴：`/Users/jc/Documents/Projects/Projects-2026/tingyumusic/`

---

## Task 1: 初始化 git 與資料夾

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: 初始化 git repo（此目錄目前不是 git repo）**

```bash
cd /Users/jc/Documents/Projects/Projects-2026/tingyumusic
git init
mkdir -p assets
```

- [ ] **Step 2: 建立 `.gitignore`**

寫入 `/Users/jc/Documents/Projects/Projects-2026/tingyumusic/.gitignore`：

```
.DS_Store
.playwright-mcp/
tingmusic-full.jpeg
node_modules/
```

- [ ] **Step 3: 首次提交**

```bash
git add .gitignore docs/
git commit -m "chore: init repo and add design spec/plan"
```

---

## Task 2: 下載本地圖片素材

**Files:**
- Create: `assets/*.png`, `assets/*.jpg`

> 圖片來自 `custom-images.strikinglycdn.com` CDN（與被擋的 strikingly app server 不同網域，curl 可正常取得）。CDN URL 結構：`.../upload/<transform>/13606413/<file>`。

- [ ] **Step 1: 下載 logo / hero / 師資照**

```bash
cd /Users/jc/Documents/Projects/Projects-2026/tingyumusic/assets
BASE="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload"
curl -sL "$BASE/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/13606413/588796_945075.png" -o logo.png
curl -sL "$BASE/c_limit,fl_lossy,h_9000,w_1200,f_auto,q_auto/13606413/5A411A00-679F-49E8-9428-44D01F67D4A6.jpg" -o hero.jpg
curl -sL "$BASE/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/13606413/237959_376269.png" -o teacher.png
```

- [ ] **Step 2: 下載 5 張課程卡 icon**

```bash
cd /Users/jc/Documents/Projects/Projects-2026/tingyumusic/assets
BASE="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload"
T="c_limit,fl_lossy,h_400,w_400,f_auto,q_auto"
curl -sL "$BASE/$T/13606413/164485_538048.png" -o icon-1.png
curl -sL "$BASE/$T/13606413/519081_485324.png" -o icon-2.png
curl -sL "$BASE/$T/13606413/292548_506710.png" -o icon-3.png
curl -sL "$BASE/$T/13606413/728379_543724.png" -o icon-4.png
curl -sL "$BASE/$T/13606413/292364_812254.png" -o icon-5.png
```

- [ ] **Step 3: 下載 12 張發表會相片**

```bash
cd /Users/jc/Documents/Projects/Projects-2026/tingyumusic/assets
BASE="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload"
T="c_limit,fl_lossy,h_900,w_900,f_auto,q_auto"
curl -sL "$BASE/$T/13606413/3DBD1E51-E650-479A-98C9-8AAB7C2945E0.jpg" -o gallery-01.jpg
curl -sL "$BASE/$T/13606413/4178DEC0-3FC2-4DFB-9E9F-F7C547E4833B.jpg" -o gallery-02.jpg
curl -sL "$BASE/$T/13606413/AB379B42-6C0E-4AFD-8987-76676A94CB42.jpg" -o gallery-03.jpg
curl -sL "$BASE/$T/13606413/BF84942F-BF14-4A9D-8690-0496751A2C24.jpg" -o gallery-04.jpg
curl -sL "$BASE/$T/13606413/170891_32375.jpeg" -o gallery-05.jpg
curl -sL "$BASE/$T/13606413/211281_355909.jpeg" -o gallery-06.jpg
curl -sL "$BASE/$T/13606413/607754_504708.jpeg" -o gallery-07.jpg
curl -sL "$BASE/$T/13606413/121272_199134.jpeg" -o gallery-08.jpg
curl -sL "$BASE/$T/13606413/621445_311285.jpeg" -o gallery-09.jpg
curl -sL "$BASE/$T/13606413/728604_829893.jpeg" -o gallery-10.jpg
curl -sL "$BASE/$T/13606413/631946_956353.jpeg" -o gallery-11.jpg
curl -sL "$BASE/$T/13606413/357682_401403.jpeg" -o gallery-12.jpg
```

- [ ] **Step 4: 驗證下載成功（檔案非空、為有效圖片）**

```bash
cd /Users/jc/Documents/Projects/Projects-2026/tingyumusic/assets
file *.png *.jpg
ls -la
```

Expected: 每個檔皆 >1KB，`file` 顯示 `PNG image data` / `JPEG image data`。若有任何檔顯示 HTML 或 0 bytes，記錄該檔名並改用替代 transform（去掉 `f_auto`，或改 `q_auto:good`）重試；仍失敗則在 Task 收尾回報。

- [ ] **Step 5: Commit**

```bash
cd /Users/jc/Documents/Projects/Projects-2026/tingyumusic
git add assets/
git commit -m "assets: download local images from CDN"
```

---

## Task 3: HTML 骨架 + Header + Hero

**Files:**
- Create: `index.html`

- [ ] **Step 1: 建立文件骨架與 `<head>`**

寫入 `/Users/jc/Documents/Projects/Projects-2026/tingyumusic/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>聽聽音樂 庭羽老師 長笛 | 鋼琴</title>
  <meta name="description" content="聽聽音樂 郭庭羽 Aria Kuo 長笛、鋼琴教學，幼兒啟蒙、成人初學、檢定比賽指導。">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Averia+Sans+Libre:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Header / Hero / Sections 接續加入 -->
  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: 加入 Header（置於 `<body>` 最前）**

```html
  <header class="site-header">
    <div class="container header-inner">
      <a href="#hero" class="logo"><img src="assets/logo.png" alt="聽聽音樂"></a>
      <button class="nav-toggle" aria-label="開啟選單" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav">
        <a href="#contact" class="btn btn-contact">與我聯絡！</a>
      </nav>
    </div>
  </header>
```

- [ ] **Step 3: 加入 Hero（Header 之後）**

```html
  <section id="hero" class="hero">
    <div class="container">
      <h1 class="hero-title">聽聽音樂</h1>
      <p class="hero-subtitle">♫長笛教學。♫鋼琴教學。♫音樂教材設計。♫上課紀錄</p>
      <img class="hero-image" src="assets/hero.jpg" alt="學生成果發表合照">
    </div>
  </section>
```

- [ ] **Step 4: 驗證渲染（暫無 CSS，僅確認結構與圖片載入）**

用 Playwright MCP：`browser_navigate` 到 `file:///Users/jc/Documents/Projects/Projects-2026/tingyumusic/index.html`，再 `browser_snapshot`。
Expected: 可見 heading「聽聽音樂」、標語文字、logo 與 hero 圖片節點；console 無 404（圖片路徑正確）。

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add html skeleton, header, hero"
```

---

## Task 4: 師資介紹區塊

**Files:**
- Modify: `index.html`（接在 Hero `</section>` 之後）

- [ ] **Step 1: 加入師資介紹 HTML**

```html
  <section id="about" class="about section section--rose">
    <div class="container">
      <h2 class="section-title">師資介紹</h2>
      <div class="about-grid">
        <img class="about-photo" src="assets/teacher.png" alt="郭庭羽 Aria Kuo">
        <div class="about-body">
          <h3 class="about-name">郭庭羽 Aria Kuo</h3>
          <p>您好，我是音樂家教老師 Aria 郭老師，自幼學習長笛與鋼琴，主修長笛、附修鋼琴，師承蔡玉敏、林珮琪老師，對於音樂有極高的熱誠，參加過許多不同的比賽並取得前三名的成績。</p>
          <p>目前從事音樂家教已經有 14 年的經驗，老師溫柔、有耐心，情緒穩定，上課有趣很受大朋友小朋友喜愛，擅長運用繪畫說故事的方式來讓學生們理解抽象的音樂內容，也會設計不同的音樂遊戲增加上課的趣味，讓學習音樂的過程充滿歡笑。</p>
          <ul class="about-credentials">
            <li>通過 ABRSM 英國皇家音樂檢定 - ARSM 長笛演奏級</li>
            <li>通過 ABRSM 英國皇家音樂檢定 - 鋼琴 8 級</li>
            <li>通過 ABRSM 英國皇家音樂檢定 - 樂理 5 級</li>
            <li>文化盃長笛比賽 - 第一名</li>
            <li>希朵夫鋼琴比賽 - 第二名</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: 驗證**

Playwright `browser_navigate` 重新整理 + `browser_snapshot`。
Expected: heading「師資介紹」「郭庭羽 Aria Kuo」、兩段簡介、5 條資歷清單皆出現，師資照載入。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add about/teacher section"
```

---

## Task 5: 長笛/鋼琴教學 課程卡區塊

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 加入課程卡 HTML**

```html
  <section id="courses" class="courses section">
    <div class="container">
      <h2 class="section-title">長笛 / 鋼琴教學</h2>
      <div class="course-grid">
        <article class="course-card">
          <img src="assets/icon-1.png" alt="" class="course-icon">
          <h3>幼兒音樂啟蒙</h3>
          <p>以繪圖、說故事及遊戲的方式，從中學習視譜能力、節奏等等，以及奠定正確彈奏 / 吹奏樂器的正確姿勢。</p>
        </article>
        <article class="course-card">
          <img src="assets/icon-2.png" alt="" class="course-icon">
          <h3>已有基礎的學生</h3>
          <p>繼續深入更有挑戰性的曲目，訓練學生有曲目分析的能力，依照學生的程度、喜歡的曲目類型，練習曲、古典音樂、流行音樂甚至動漫音樂都可以加入，讓學音樂不再枯燥乏味。</p>
        </article>
        <article class="course-card">
          <img src="assets/icon-3.png" alt="" class="course-icon">
          <h3>成人初學</h3>
          <p>可互相討論想要學習的方向來安排課程內容，也會加入基本樂理知識或是像大多的成人學生比較喜歡的流行歌，會根據學生的程度幫忙編排成適合彈奏的難度。</p>
        </article>
        <article class="course-card">
          <img src="assets/icon-4.png" alt="" class="course-icon">
          <h3>長笛團班</h3>
          <p>歡迎找 2 ～ 4 位朋友一起來上課，享受音樂與合奏的樂趣，舒壓平時上班上課的壓力。</p>
        </article>
        <article class="course-card">
          <img src="assets/icon-5.png" alt="" class="course-icon">
          <h3>音樂檢定、比賽</h3>
          <p>ABRSM 英國皇家音樂檢定、Yamaha 音樂檢定以及音樂比賽指導。</p>
        </article>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: 驗證**

Playwright snapshot：5 張卡標題（幼兒音樂啟蒙 / 已有基礎的學生 / 成人初學 / 長笛團班 / 音樂檢定、比賽）與說明、icon 皆出現。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add courses section"
```

---

## Task 6: 學生演出影片區塊（YouTube 嵌入）

**Files:**
- Modify: `index.html`

> YouTube `youtu.be/<id>` → 嵌入網址 `https://www.youtube.com/embed/<id>`。4 部影片 id：`wnEmoi3gQ50` / `tE8csMe-urU` / `sG395okhOy8` / `k5kHF68hHME`。

- [ ] **Step 1: 加入影片區 HTML**

```html
  <section id="videos" class="videos section section--brown">
    <div class="container">
      <h2 class="section-title">學生演出精彩片段</h2>
      <p class="videos-intro">成果發表會、檢定考試等演出，更多精彩影片請至<a href="https://www.youtube.com/@ting-ting-music" target="_blank" rel="noopener">聽聽音樂 Youtube</a>觀看</p>
      <div class="video-grid">
        <article class="video-card">
          <div class="video-embed">
            <iframe src="https://www.youtube.com/embed/wnEmoi3gQ50" title="Martin Cuellar : Toccata" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
          </div>
          <h4>Martin Cuellar : Toccata</h4>
          <p>演出者：Kana</p>
        </article>
        <article class="video-card">
          <div class="video-embed">
            <iframe src="https://www.youtube.com/embed/tE8csMe-urU" title="柴可夫斯基：睡美人的華爾滋" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
          </div>
          <h4>柴可夫斯基：睡美人的華爾滋</h4>
          <p>演出者：Lily</p>
        </article>
        <article class="video-card">
          <div class="video-embed">
            <iframe src="https://www.youtube.com/embed/sG395okhOy8" title="魔法公主 Princess mononoke" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
          </div>
          <h4>魔法公主 Princess mononoke</h4>
          <p>演出者：Effie</p>
        </article>
        <article class="video-card">
          <div class="video-embed">
            <iframe src="https://www.youtube.com/embed/k5kHF68hHME" title="威尼斯狂歡節" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
          </div>
          <h4>威尼斯狂歡節</h4>
          <p>演出者：Daphne</p>
        </article>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: 驗證**

Playwright snapshot：4 張影片卡標題與演出者出現，4 個 `iframe` 節點存在；console 無錯誤。（嵌入是否實際播放依網路，結構正確即可。）

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add student performance videos section"
```

---

## Task 7: 發表會相片牆區塊

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 加入相片牆 HTML**

```html
  <section id="recital" class="recital section">
    <div class="container">
      <h2 class="section-title">2025 郭老師音樂發表會</h2>
      <div class="gallery">
        <a class="gallery-item" href="assets/gallery-01.jpg" target="_blank" rel="noopener"><img src="assets/gallery-01.jpg" alt="2025 發表會相片 1" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-02.jpg" target="_blank" rel="noopener"><img src="assets/gallery-02.jpg" alt="2025 發表會相片 2" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-03.jpg" target="_blank" rel="noopener"><img src="assets/gallery-03.jpg" alt="2025 發表會相片 3" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-04.jpg" target="_blank" rel="noopener"><img src="assets/gallery-04.jpg" alt="2025 發表會相片 4" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-05.jpg" target="_blank" rel="noopener"><img src="assets/gallery-05.jpg" alt="2025 發表會相片 5" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-06.jpg" target="_blank" rel="noopener"><img src="assets/gallery-06.jpg" alt="2025 發表會相片 6" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-07.jpg" target="_blank" rel="noopener"><img src="assets/gallery-07.jpg" alt="2025 發表會相片 7" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-08.jpg" target="_blank" rel="noopener"><img src="assets/gallery-08.jpg" alt="2025 發表會相片 8" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-09.jpg" target="_blank" rel="noopener"><img src="assets/gallery-09.jpg" alt="2025 發表會相片 9" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-10.jpg" target="_blank" rel="noopener"><img src="assets/gallery-10.jpg" alt="2025 發表會相片 10" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-11.jpg" target="_blank" rel="noopener"><img src="assets/gallery-11.jpg" alt="2025 發表會相片 11" loading="lazy"></a>
        <a class="gallery-item" href="assets/gallery-12.jpg" target="_blank" rel="noopener"><img src="assets/gallery-12.jpg" alt="2025 發表會相片 12" loading="lazy"></a>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: 驗證**

Playwright snapshot + `browser_evaluate` 計算 `document.querySelectorAll('.gallery-item img').length === 12` 且每張 `naturalWidth > 0`（圖片成功載入）。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add recital photo gallery section"
```

---

## Task 8: 獲獎紀錄區塊

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 加入獲獎紀錄 HTML（內容逐字取自原站快照）**

```html
  <section id="awards" class="awards section section--rose">
    <div class="container">
      <h2 class="section-title">學生檢定、比賽獲獎紀錄</h2>
      <div class="awards-grid">
        <div class="awards-col">
          <h3>檢定</h3>
          <ul>
            <li>恭喜香奈通過英國皇家音樂檢定 Abrsm 鋼琴四級優良。</li>
            <li>恭喜張*珺通過英國皇家音樂檢定 Abrsm 長笛三級。</li>
            <li>恭喜黃*恩通過英國皇家音樂檢定 Abrsm 鋼琴三級優良。</li>
            <li>恭喜黃*安通過英國皇家音樂檢定 Abrsm 鋼琴二級優良。</li>
            <li>恭喜林*恩通過英國皇家音樂檢定 Abrsm 長笛二級優良。</li>
            <li>恭喜紀*怡通過英國皇家音樂檢定 Abrsm 長笛三級優良。</li>
            <li>恭喜谷*蓁通過 Yamaha 長笛檢定10級</li>
            <li>恭喜陳*瑀通過 Yamaha 鋼琴檢定11級</li>
            <li>恭喜楊*縈通過 Yamaha 鋼琴檢定13級</li>
            <li>恭喜蔡*縈通過 Yamaha 鋼琴檢定13級</li>
            <li>恭喜簡*羽通過 Yamaha 鋼琴檢定13級</li>
            <li>恭喜王*棠通過 Yamaha 鋼琴檢定13級</li>
            <li>恭喜李*倢通過 Yamaha 鋼琴檢定13級</li>
            <li>恭喜張*奕通過 Yamaha 鋼琴檢定11級</li>
          </ul>
        </div>
        <div class="awards-col">
          <h3>比賽</h3>
          <ul>
            <li>恭喜黃*安參加希朵夫古典鋼琴比賽榮獲第四名</li>
            <li>恭喜王*可參加法雅盃流行鋼琴比賽榮獲第二名</li>
            <li>恭喜張*珺參加歐洲盃長笛比賽榮獲第二名</li>
            <li>恭喜李*倢參加布拉格古典鋼琴比賽成績優良</li>
          </ul>
        </div>
        <div class="awards-col">
          <h3>音樂班 / 樂團</h3>
          <ul>
            <li>恭喜孫*嫻錄取青年管樂團少年二團 - 長笛分部</li>
            <li>恭喜曾*恩考上敦化國小音樂班 - 長笛副修</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: 驗證**

Playwright snapshot：三欄標題（檢定/比賽/音樂班 / 樂團）與清單筆數（14 / 4 / 2）正確。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add awards records section"
```

---

## Task 9: 聯絡區塊 + Footer（含 mailto 表單結構）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 加入聯絡區與 footer HTML**

```html
  <section id="contact" class="contact section section--rose">
    <div class="container">
      <h2 class="section-title">與我聯絡</h2>
      <div class="contact-grid">
        <div class="contact-info">
          <p class="contact-line"><span class="contact-ico">📍</span>行天宮捷運站 4 號出口步行3分鐘</p>
          <p class="contact-line"><span class="contact-ico">💬</span>Line ID : juicekuo</p>
          <p class="contact-line"><span class="contact-ico">✉️</span><a href="mailto:juicekuo@gmail.com">juicekuo@gmail.com</a></p>
        </div>
        <form class="contact-form" id="contact-form" novalidate>
          <div class="form-row">
            <label class="field">
              <span class="field-label">姓名</span>
              <input type="text" name="name" required>
            </label>
            <label class="field">
              <span class="field-label">電子信箱</span>
              <input type="email" name="email" required>
            </label>
          </div>
          <label class="field">
            <span class="field-label">我想要學習.........</span>
            <textarea name="message" rows="4"></textarea>
          </label>
          <p class="form-error" id="form-error" role="alert" hidden></p>
          <button type="submit" class="btn btn-submit">送出</button>
        </form>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div class="container">
      <p>TingTingMusic © 2026</p>
    </div>
  </footer>
```

- [ ] **Step 2: 驗證**

Playwright snapshot：聯絡資訊三行（地址 / Line ID / email mailto 連結）、表單三欄位 + 送出按鈕、footer 文字出現。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add contact section and footer"
```

---

## Task 10: `script.js` — 漢堡選單、平滑捲動、mailto 表單

**Files:**
- Create: `script.js`

- [ ] **Step 1: 寫入完整 `script.js`**

寫入 `/Users/jc/Documents/Projects/Projects-2026/tingyumusic/script.js`：

```js
// 聽聽音樂 — 互動腳本：漢堡選單、平滑捲動、mailto 聯絡表單
(function () {
  'use strict';

  function initMobileMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // 點導覽連結後收合選單
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // 由表單欄位組出 mailto: 連結
  function buildMailto(name, email, message) {
    var subject = '音樂課程詢問 - ' + name;
    var body =
      '姓名：' + name + '\n' +
      '回信信箱：' + email + '\n\n' +
      '我想要學習：\n' + (message || '（未填寫）');
    return 'mailto:juicekuo@gmail.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    var errorEl = document.getElementById('form-error');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();

      var error = '';
      if (!name) error = '請填寫姓名';
      else if (!email) error = '請填寫電子信箱';
      else if (!isValidEmail(email)) error = '電子信箱格式不正確';

      if (error) {
        if (errorEl) { errorEl.textContent = error; errorEl.hidden = false; }
        return;
      }
      if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }

      window.location.href = buildMailto(name, email, message);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
  });

  // 供測試存取
  window.__tingmusic = { buildMailto: buildMailto, isValidEmail: isValidEmail };
})();
```

- [ ] **Step 2: 驗證 `buildMailto` 與驗證邏輯**

Playwright `browser_navigate` 重新載入後 `browser_evaluate`：

```js
() => {
  const m = window.__tingmusic.buildMailto('小明', 'a@b.com', '長笛');
  return {
    startsOk: m.startsWith('mailto:juicekuo@gmail.com?subject='),
    hasSubject: decodeURIComponent(m.split('subject=')[1].split('&')[0]) === '音樂課程詢問 - 小明',
    bodyHasEmail: decodeURIComponent(m.split('body=')[1]).includes('回信信箱：a@b.com'),
    emailValid: window.__tingmusic.isValidEmail('a@b.com'),
    emailInvalid: window.__tingmusic.isValidEmail('bad'),
  };
}
```

Expected: `{ startsOk: true, hasSubject: true, bodyHasEmail: true, emailValid: true, emailInvalid: false }`。

- [ ] **Step 3: 驗證空欄位顯示錯誤、不導向**

Playwright：用 `browser_click` 點「送出」（未填欄位），`browser_snapshot` 應看到 `#form-error` 顯示「請填寫姓名」，且頁面 URL 未變為 mailto。

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add mobile menu, smooth scroll, mailto contact form"
```

---

## Task 11: `style.css` — 設計 token、版面、元件樣式

**Files:**
- Create: `style.css`

- [ ] **Step 1: 寫入基底 + 設計 token + 共用元件**

寫入 `/Users/jc/Documents/Projects/Projects-2026/tingyumusic/style.css`：

```css
/* ===== 設計 token ===== */
:root {
  --c-white: #ffffff;
  --c-rose: #e6dddd;
  --c-brown: #9d8873;
  --c-text: #1d2023;
  --c-muted: #6b6b6b;
  --font-display: "Averia Sans Libre", "PingFang TC", "Microsoft JhengHei", sans-serif;
  --font-body: "PingFang TC", "Microsoft JhengHei", "微軟正黑體", STXihei, sans-serif;
  --maxw: 1100px;
  --pad: 24px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--c-text);
  line-height: 1.8;
  background: var(--c-white);
}
img { max-width: 100%; display: block; }
a { color: inherit; }

.container { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--pad); }

.section { padding: 72px 0; }
.section--rose { background: var(--c-rose); }
.section--brown { background: var(--c-brown); color: var(--c-white); }
.section-title {
  font-family: var(--font-display);
  font-size: 2rem;
  text-align: center;
  margin: 0 0 40px;
  font-weight: 700;
}

.btn {
  display: inline-block;
  padding: 10px 22px;
  border: 1px solid currentColor;
  border-radius: 4px;
  text-decoration: none;
  background: transparent;
  font-family: var(--font-display);
  cursor: pointer;
  transition: background .2s, color .2s;
}
.btn-contact:hover { background: var(--c-text); color: var(--c-white); }
```

- [ ] **Step 2: 加入 Header 與 Hero 樣式（接續寫入同檔）**

```css
/* ===== Header ===== */
.site-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,.96);
  border-bottom: 1px solid #eee;
}
.header-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.logo img { height: 40px; width: auto; }
.site-nav { display: flex; gap: 16px; }
.nav-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: 0; cursor: pointer; padding: 8px; }
.nav-toggle span { width: 24px; height: 2px; background: var(--c-text); display: block; }

/* ===== Hero ===== */
.hero { padding: 56px 0; text-align: center; }
.hero-title { font-family: var(--font-display); font-size: 2.4rem; margin: 0 0 12px; }
.hero-subtitle { color: var(--c-muted); margin: 0 0 32px; }
.hero-image { width: 100%; max-width: 960px; margin: 0 auto; border-radius: 6px; }
```

- [ ] **Step 3: 加入 About / Courses 樣式**

```css
/* ===== About ===== */
.about-grid { display: grid; grid-template-columns: 240px 1fr; gap: 40px; align-items: start; }
.about-photo { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; margin: 0 auto; }
.about-name { font-family: var(--font-display); font-size: 1.4rem; margin: 0 0 16px; }
.about-credentials { margin-top: 20px; padding-left: 20px; }
.about-credentials li { margin: 6px 0; }

/* ===== Courses ===== */
.course-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 28px; }
.course-card { text-align: center; }
.course-icon { width: 72px; height: 72px; object-fit: contain; margin: 0 auto 16px; }
.course-card h3 { font-family: var(--font-display); font-size: 1.1rem; margin: 0 0 10px; }
.course-card p { font-size: .92rem; color: var(--c-muted); }
```

- [ ] **Step 4: 加入 Videos / Recital / Awards / Contact / Footer 樣式**

```css
/* ===== Videos ===== */
.videos-intro { text-align: center; margin: -20px 0 36px; }
.videos-intro a { text-decoration: underline; }
.video-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
.video-embed { position: relative; padding-top: 56.25%; }
.video-embed iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; border-radius: 6px; }
.video-card h4 { font-family: var(--font-display); margin: 14px 0 4px; }
.video-card p { margin: 0; opacity: .85; font-size: .9rem; }

/* ===== Recital gallery ===== */
.gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.gallery-item img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 4px; }

/* ===== Awards ===== */
.awards-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 32px; }
.awards-col h3 { font-family: var(--font-display); border-bottom: 2px solid var(--c-brown); padding-bottom: 8px; }
.awards-col ul { padding-left: 18px; }
.awards-col li { margin: 8px 0; font-size: .92rem; }

/* ===== Contact ===== */
.contact-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 40px; align-items: start; }
.contact-line { display: flex; gap: 10px; align-items: center; margin: 14px 0; }
.contact-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: block; margin-bottom: 16px; }
.field-label { display: block; font-size: .85rem; margin-bottom: 6px; }
.field input, .field textarea {
  width: 100%; padding: 10px 12px; border: 1px solid #c9bcbc;
  border-radius: 4px; font: inherit; background: #fff;
}
.form-error { color: #b00020; margin: 0 0 12px; font-size: .9rem; }
.btn-submit { background: var(--c-text); color: var(--c-white); border-color: var(--c-text); }

/* ===== Footer ===== */
.site-footer { background: var(--c-brown); color: var(--c-white); text-align: center; padding: 28px 0; }
```

- [ ] **Step 5: 驗證桌機版渲染**

Playwright `browser_navigate` 重新載入 + `browser_take_screenshot`（fullPage）。
Expected: 版面與原站相似 — 玫瑰灰 / 咖啡棕區塊正確、課程卡橫排、影片 2x2、相片牆 4 欄、獲獎 3 欄、聯絡左右兩欄、無破版。

- [ ] **Step 6: Commit**

```bash
git add style.css
git commit -m "feat: add full stylesheet with design tokens and layout"
```

---

## Task 12: RWD media queries

**Files:**
- Modify: `style.css`（檔尾追加）

- [ ] **Step 1: 追加平板 / 手機斷點樣式**

```css
/* ===== RWD ===== */
@media (max-width: 768px) {
  .section { padding: 48px 0; }
  .section-title { font-size: 1.6rem; }

  /* 導覽轉漢堡 */
  .nav-toggle { display: flex; }
  .site-nav {
    position: absolute; top: 64px; right: 0; left: 0;
    background: #fff; flex-direction: column; align-items: center;
    gap: 0; padding: 0; max-height: 0; overflow: hidden;
    border-bottom: 1px solid #eee; transition: max-height .25s ease;
  }
  body.nav-open .site-nav { max-height: 200px; padding: 16px 0; }

  .about-grid { grid-template-columns: 1fr; text-align: center; }
  .video-grid { grid-template-columns: 1fr; }
  .gallery { grid-template-columns: repeat(3, 1fr); }
  .awards-grid { grid-template-columns: 1fr; }
  .contact-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .hero-title { font-size: 1.8rem; }
  .gallery { grid-template-columns: repeat(2, 1fr); }
  .contact-form .form-row { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: 驗證手機版（375px）**

Playwright：先 `browser_resize`（width 375, height 800），`browser_navigate` 重新載入，`browser_take_screenshot`（fullPage）。
Expected: 導覽收成漢堡、各區塊單欄、相片牆 2 欄、表單欄位上下堆疊、**無水平捲動**。

- [ ] **Step 3: 驗證漢堡選單可開合**

Playwright（仍 375px）：`browser_click` 點 `.nav-toggle`，`browser_snapshot` 確認「與我聯絡！」連結變可見；再點一次收合。

- [ ] **Step 4: 驗證平板版（768px）**

Playwright `browser_resize`（768x1024）重新載入截圖：相片牆 3 欄、影片單欄、無破版。

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "feat: add responsive breakpoints for tablet and mobile"
```

---

## Task 13: 整體驗收與收尾

**Files:**
- 無新增（最終檢查）

- [ ] **Step 1: 跑完整驗收清單（對照 spec §8）**

Playwright 在桌機（1280）、平板（768）、手機（375）三寬度各 `browser_navigate` + `browser_take_screenshot`，並 `browser_evaluate` 檢查：
```js
() => ({
  galleryCount: document.querySelectorAll('.gallery-item img').length,            // 12
  videoCount: document.querySelectorAll('.video-embed iframe').length,            // 4
  brokenImgs: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src),
  hasStrikingly: document.body.innerHTML.includes('strikingly') || document.body.innerHTML.includes('hCaptcha'),
})
```
Expected: `galleryCount: 12`、`videoCount: 4`、`brokenImgs: []`、`hasStrikingly: false`。

- [ ] **Step 2: 檢查 console 無 error**

Playwright `browser_console_messages`，確認 0 errors（YouTube 第三方 warning 可忽略）。

- [ ] **Step 3: 修正發現的問題**

若有破圖、破版或 console error，於對應檔案修正後重新驗證。

- [ ] **Step 4: 最終提交**

```bash
cd /Users/jc/Documents/Projects/Projects-2026/tingyumusic
git add -A
git commit -m "chore: final verification pass for tingmusic static clone"
```

---

## Self-Review（對照 spec）

- **Spec §4 九大區塊** → Task 3（Header/Hero）、4（About）、5（Courses）、6（Videos）、7（Recital）、8（Awards）、9（Contact/Footer）逐一覆蓋。✓
- **Spec §5 mailto 表單** → Task 9 結構 + Task 10 `buildMailto`/驗證/攔截送出，主旨「音樂課程詢問 - {姓名}」與內文格式一致。✓
- **Spec §6 RWD（768/480 斷點、漢堡、堆疊、相片牆欄數）** → Task 12 全數覆蓋。✓
- **Spec §2 本地圖片** → Task 2 下載全部素材，Task 13 檢查 `brokenImgs: []`。✓
- **Spec §3 設計 token（配色/字體）** → Task 11 `:root` 變數一致（`#E6DDDD` / `#9D8873` / `#1D2023` / Averia Sans Libre）。✓
- **Spec §8 驗收標準** → Task 13 對照檢查（區塊、三寬度、本地圖、4 影片、表單、無 Strikingly 殘留）。✓
- **命名一致性**：`buildMailto` / `isValidEmail` / `initContactForm` 於 Task 10 定義並於 Task 10 Step 2-3 引用，名稱一致。CSS class（`.section--rose` / `.section--brown` / `.gallery-item` / `.video-embed`）於 HTML 與 CSS 任務間一致。✓
- **Placeholder 掃描**：無 TBD/TODO；所有 code step 皆含完整內容。✓
