# CLAUDE.md

聽聽音樂 / 郭庭羽 Aria Kuo 的教學官網 + 部落格。給 Claude Code 的專案指南。

## 這是什麼

- **網站**：https://tingyumusic.com — 長笛・鋼琴一對一教學的**在地服務型單頁網站**(台北市中山區，行天宮捷運站步行 4 分鐘)。
- **對象**：學生家長、成人學習者。聯絡以 **Line `@897rgmut`** 為主(刻意不公開電話)。
- **部落格**：「Aria 老師碎碎念」(`/blog/`)，給家長與成人的長笛・鋼琴學習筆記。

## 技術與部署(最重要)

- **純靜態手寫 HTML，無建置流程、無框架**。CSS 內嵌在各 HTML 的 `<style>`(主站)或共用 `assets/blog.css`(部落格)。
- **GitHub Pages 部署**，repo = `juicekuo1227/juicekuo1227.github.io`，自訂網域靠 `CNAME`，有 `.nojekyll`。
- ⚠️ **部署 = push 到 `main`。push 就是上線。**
- ⚠️ **慣例:只 commit，不 push。push 只在使用者明確要求時做。** commit 訊息結尾加
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

## 目錄結構

```
index.html              主站單頁(內嵌 CSS/JS;teacher、contact 區內容由頁尾 JS 注入)
assets/                 圖片(hero/teacher/cover/gallery-*/thumb-*/logo/icon-*)
assets/blog.css         部落格共用樣式(沿用主站設計 token)
blog/index.html         部落格首頁(文章卡列表)
blog/<slug>.html        每篇文章(獨立 URL/SEO)
blog/topics.md          10 篇主題清單與進度([x]完成 [~]下架 [ ]待寫)
assets/blog/<slug>/      該篇插畫(cover.png + inline-*.png，1024×1024)
scripts/gen-illustration.sh  Gemini 插畫生成腳本
robots.txt, sitemap.xml  SEO;新頁面都要加進 sitemap
docs/seo/                SEO 執行方案與進度
docs/superpowers/        部落格 spec 與實作計畫
```

## 設計系統

- 色:`--ivory #F7F3EA`、`--paper #FCFAF4`、`--ink #211C16`、`--gold #B08D4F`、`--gold-deep #8C6E38`、`--line #DDD2BE`。
- 字體:Cormorant Garamond(拉丁標題)、Noto Serif TC(中文標題/引言)、Noto Sans TC(內文)。字重已精簡(只載入實際用到的)以利行動版效能。
- 部落格透過 `assets/blog.css` 重用同一套 token，視覺與主站一致。

## SEO 現況(已完成)

- 每頁有 `title`/`meta description`/`canonical`/Open Graph;主站有 `LocalBusiness`/`Person`/`Course`/`FAQPage` 的 `@graph` JSON-LD，文章用 `Article` JSON-LD。
- 地區資訊:台北市中山區、行天宮捷運站、`postalCode 104`、`areaServed 台北市、新北市`。
- 分析:GA4 `G-JE1G1W4X4V` + Microsoft Clarity `x3vmaaiw0l`(在 `<head>`)。
- 社群分享縮圖用 `assets/cover.jpg`(主視覺插畫);頁面 hero 與 JSON-LD image 用真實合照。
- 外部(已設定，使用者操作):Google Search Console(已提交 sitemap、要求索引)、Google 商家檔案(類別=音樂教師)。

## 部落格寫作慣例(寫文章必讀)

- **口吻**:像朋友聊天、第二人稱「你」、帶 Aria 第一人稱視角(「我都跟學生說…」)、幾乎不用 emoji、不誇大、具體價格不寫死(引導 Line 預約)。
- **節奏**:句子長短落差要大 —— 長句鋪陳後接一個很短的句子(2~5 字)。**避免兩個等長並排子句**(那讀起來太平)。
- **標點**:中文內文一律**全形**(，：？！等),半形只留在程式碼/JSON-LD/URL/CSS。
- **不顯示發佈日期**(避免洩漏同批產出);文章 `post-meta` 只寫「Aria 老師」，JSON-LD 不放 `datePublished`。
- **插畫**:`scripts/gen-illustration.sh "<英文主體描述>" <輸出.png>`，用 Gemini `gemini-2.5-flash-image` 產 1024×1024 暖色**平面場景**插畫(no gradient、no text)。需 `GEMINI_API_KEY`(已設環境變數)、`jq`。每篇 2~3 張。
- **新增文章**要同步:寫 `blog/<slug>.html`、加 `blog/index.html` 卡片、加 `sitemap.xml`、更新 `blog/topics.md` 狀態。

## 開發/驗證

- 本機預覽:`python3 -m http.server 8731`，瀏覽器開 `http://localhost:8731/`(Playwright MCP 擋 `file://`，一定要起 server)。
- 效能:`CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx lighthouse@latest <url> ...`。
- 驗 JSON-LD/sitemap:`python3` 解析即可。

## 雷區

- `index.html` 常被 IDE/linter 重新同步 → Edit 比對失敗時先重新 Read 該段。
- **不要對標點做全檔 sed**(會破壞 JSON-LD/CSS/URL 裡的半形符號);只改「中文相鄰」的半形標點。
- 改圖片檔名時,要同步更新所有引用(`<img>`、`og:image`、JSON-LD `image`)。
- 改 og:image 後,各社群平台有快取,需用偵錯工具強制重抓。
