# tingyumusic.com SEO 優化執行方案

> **用途**:這是一份交接規格文件,讓 Claude Code(或其他工程協作)直接接手執行。
> **網站**:https://tingyumusic.com/ (聽聽音樂 / 郭庭羽 Aria Kuo・長笛鋼琴教學)
> **網站性質**:在地服務型單頁網站(教學業)。SEO 主軸是**在地 SEO + 讓網站被收錄**,而非一般部落格的關鍵字操作。

---

## 0. 給 Claude Code 的開場說明

請依下列原則執行:

1. **先盤點 codebase 再動手**。本文件根據前台畫面撰寫,你需要先確認實際架構:是純靜態 HTML、還是用框架(如 Astro / Next / Vue)、或建站工具產生。這會決定「拆分頁面」與「插入 meta / JSON-LD」的做法。
2. **遇到 `{{雙大括號}}` 的placeholder**,代表需要真實資料(見第 2 節)。若使用者未提供,先以合理預設值填入並在程式碼旁標 `// TODO: 確認`,不要卡住整份工作。
3. **每個任務都附「驗收方式」**,完成後請自行檢查。
4. **不要嘗試第 8 節的任務**(需登入第三方帳號的人工操作),只需在最後提醒使用者去做。
5. 按 **第 9 節的順序** 執行,Phase 1~3 是高投報率、低風險,優先完成。

---

## 1. 現況觀察(從前台)

- 單頁式網站(純靜態 `index.html`,GitHub Pages 部署,已有 `.nojekyll` + `CNAME`),以錨點導覽(`#teacher`、`#courses`、`#videos`、`#recital`、`#awards`、`#contact`)。
- 已有 `<title>`(現為 `郭庭羽 Aria Kuo ‧ 長笛鋼琴教學`,無地區)與 `meta description`、`meta viewport`,基礎尚可。
- **未發現任何地區/上課地點/電話/地址資訊** → 在地 SEO 最大缺口。
- **目前完全沒有 canonical、Open Graph 標籤、JSON-LD 結構化資料**(後面 Phase 2/3 皆為新增)。
- **區段標題目前都是 `<div class="sec-title">`(假標題,共 5 處),全頁沒有任何 `<h2>`**(對應 4.3 要修)。
- 圖片檔名為 `hero.jpg`、`teacher.png`(無語意)。
- 已有社群:YouTube `@ting-ting-music`、Instagram `ting.ting.music`、Line `@897rgmut`。
- 新站,搜尋引擎目前尚未收錄。

---

## 2. 需使用者先提供的資料(placeholder 對照表)

| placeholder | 說明 | 範例 |
|---|---|---|
| `{{縣市}}` | 縣市 | 台北市 |
| `{{行政區}}` | 主要上課行政區 | 大安區 |
| `{{服務區域}}` | 涵蓋區域或是否到府 | 台北市、新北市,可到府 |
| `{{電話}}` | 聯絡電話(可留空,用 Line 代替) | +886-9xx-xxx-xxx |
| `{{上課地址}}` | 實際教室地址(若有) | — |
| `{{畢業學校}}` | 師資學歷 | 國立○○大學音樂系 |
| `{{主要客群}}` | 行銷主軸 | 幼兒啟蒙 / 成人初學 / 檢定比賽 |

> 若使用者主攻某客群(例:成人初學),關鍵字與文案應向該客群傾斜。

---

## 3. Phase 1 — 讓網站可被收錄(技術地基)　✅ 已完成(2026-06-09)

### 3.1 建立 `robots.txt`(放網站根目錄)
```txt
User-agent: *
Allow: /

Sitemap: https://tingyumusic.com/sitemap.xml
```
**驗收**:瀏覽器開 `https://tingyumusic.com/robots.txt` 能看到內容。

### 3.2 建立 `sitemap.xml`(放網站根目錄)
單頁版本:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tingyumusic.com/</loc>
    <lastmod>2026-06-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```
> 若後續執行 Phase 4 拆成多頁,每個新頁面都要新增一組 `<url>`。

**驗收**:`https://tingyumusic.com/sitemap.xml` 可開啟且為合法 XML。

### 3.3 確認 `<head>` 基礎標籤
確認存在(缺則補):
```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="canonical" href="https://tingyumusic.com/">
```

---

## 4. Phase 2 — 站內 On-page 優化　🔶 大致完成(WebP 壓縮未做)

### 4.1 強化 title 與 description(置入地區與客群)
```html
<title>{{縣市}}{{行政區}}長笛・鋼琴教學｜郭庭羽 Aria Kuo</title>
<meta name="description" content="{{縣市}}{{行政區}}長笛、鋼琴一對一教學。郭庭羽 Aria Kuo 老師,專長幼兒音樂啟蒙、成人零基礎入門、檢定與比賽指導。歡迎預約諮詢。">
```
**規則**:title 控制在 ~30 個全形字內(行動版約 28–32 字會被截斷),優先放「地區 + 樂器 + 人名」;客群關鍵字(幼兒啟蒙・成人初學・檢定比賽)留給 description 與內文,不要硬塞進 title。description ~80–120 字,需含「地區 + 樂器 + 客群」。
> 反例:`長笛・鋼琴教學｜{{縣市}}{{行政區}} 郭庭羽 Aria Kuo｜幼兒啟蒙・成人初學・檢定比賽` 全形字數遠超過 30,會被截斷,勿用。

### 4.2 Open Graph(社群分享預覽)
```html
<meta property="og:type" content="website">
<meta property="og:title" content="長笛・鋼琴教學｜{{縣市}}{{行政區}} 郭庭羽 Aria Kuo">
<meta property="og:description" content="幼兒啟蒙・成人初學・檢定比賽指導,歡迎預約諮詢。">
<meta property="og:image" content="https://tingyumusic.com/assets/hero.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="郭庭羽 Aria Kuo 長笛・鋼琴教學">
<meta property="og:url" content="https://tingyumusic.com/">
```
> ⚠️ `og:image` 路徑須與實際檔名一致。若已執行 4.4 改檔名,這裡的 `hero.jpg` 要一併改成新檔名。建議分享圖尺寸 1200×630。

### 4.3 標題層級(H1/H2)
- 全頁**只有一個 `<h1>`**,內含主關鍵字,例:`{{縣市}} 長笛・鋼琴教學 — 郭庭羽 Aria Kuo`。
- 各區段標題用 `<h2>`(師資介紹 / 課程 / 學生演出 / 發表會 / 獲獎紀錄 / 與我聯絡),避免用純樣式假標題。

**驗收**:整頁 `h1` 數量為 1;區段標題為語意化標籤。

### 4.4 圖片優化
- ✅ 重新命名:`hero.jpg` → `flute-piano-students-recital.jpg`;`teacher.png` → `aria-kuo-flute-teacher.png`(引用已全數同步)。
- ✅ 補 `alt`(所有 `<img>` 皆已加描述性 alt)。
- ⬜ **壓縮並輸出 WebP:尚未做**(執行環境無 `cwebp`/`magick`,跳過待辦)。`teacher` 圖已加 `loading="lazy"`;hero 圖原本的 `width`/`height` 因解析度不符已移除,改由 CSS `aspect-ratio` 控制。

> ⚠️ **改檔名後務必同步更新所有引用**,否則圖片會 404:
> - HTML 內的 `<img src="assets/hero.jpg">`、`<img src="assets/teacher.png">`
> - 4.2 節 `og:image`(原寫 `assets/hero.jpg`)
> - 第 5 節 JSON-LD 的 `image` 欄位(原寫 `assets/hero.jpg`)
> 建議「改檔名」與「更新引用」當成同一個任務一次做完,或先完成 4.2 / 5 再回頭改檔名。

**驗收**:所有 `<img>` 皆有具描述性的 `alt`;改檔名後 og:image 與 JSON-LD 的 image 路徑皆可開啟(無 404);Lighthouse 的 image 相關項目無警告。

### 4.5 在頁面內容寫入地區資訊
在「與我聯絡」或頁尾加入可被索引的文字(非僅圖片),例如服務區域、上課方式、是否到府。這是在地 SEO 的關鍵文字訊號。

---

## 5. Phase 3 — 結構化資料(JSON-LD)　✅ 已完成(電話/畢業學校欄位待補)

在 `<head>` 或 `</body>` 前插入下列 `<script>`(已用 `@graph` 整合多型別):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://tingyumusic.com/#business",
      "name": "聽聽音樂 TingTing Music",
      "description": "{{縣市}}{{行政區}}長笛、鋼琴一對一教學,提供幼兒啟蒙、成人初學、檢定與比賽指導。",
      "url": "https://tingyumusic.com/",
      "image": "https://tingyumusic.com/assets/hero.jpg",
      "telephone": "{{電話}}",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "{{行政區}}",
        "addressRegion": "{{縣市}}",
        "addressCountry": "TW"
      },
      "areaServed": "{{服務區域}}",
      "sameAs": [
        "https://www.youtube.com/@ting-ting-music",
        "https://www.instagram.com/ting.ting.music/",
        "https://line.me/R/ti/p/%40897rgmut"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://tingyumusic.com/#teacher",
      "name": "郭庭羽 Aria Kuo",
      "jobTitle": "長笛・鋼琴教師",
      "worksFor": { "@id": "https://tingyumusic.com/#business" },
      "alumniOf": "{{畢業學校}}",
      "knowsAbout": ["長笛教學", "鋼琴教學", "音樂檢定", "音樂比賽指導", "幼兒音樂啟蒙"]
    },
    {
      "@type": "Course",
      "name": "長笛一對一課程",
      "description": "依學生程度客製的長笛課程,涵蓋啟蒙、進階、檢定與比賽準備。",
      "provider": { "@id": "https://tingyumusic.com/#business" }
    },
    {
      "@type": "Course",
      "name": "鋼琴一對一課程",
      "description": "幼兒啟蒙至成人初學的鋼琴課程,客製化進度。",
      "provider": { "@id": "https://tingyumusic.com/#business" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "幾歲可以開始學長笛 / 鋼琴?",
          "acceptedAnswer": { "@type": "Answer", "text": "{{TODO: 補上實際回答}}" }
        },
        {
          "@type": "Question",
          "name": "完全沒基礎的成人可以學嗎?",
          "acceptedAnswer": { "@type": "Answer", "text": "{{TODO: 補上實際回答}}" }
        },
        {
          "@type": "Question",
          "name": "需要自備樂器嗎?學費怎麼計算?",
          "acceptedAnswer": { "@type": "Answer", "text": "{{TODO: 補上實際回答}}" }
        }
      ]
    }
  ]
}
</script>
```

**注意事項**:
- JSON-LD 內容必須與頁面上實際可見的文字一致(尤其 FAQ),否則違反 Google 規範。
- FAQ 的「富摘要外觀」近年 Google 已大幅限縮顯示,但標記與頁面上的 FAQ 內容對 SEO 仍有價值,保留即可。
- 若想取得 Course 的富結果,需再補 `offers` / `hasCourseInstance` 等欄位;非必要可暫緩。

**驗收**:用 Google [Rich Results Test](https://search.google.com/test/rich-results) 與 [Schema Markup Validator](https://validator.schema.org/) 驗證無錯誤。

---

## 6. Phase 4 — 內容架構(較大工程,可分批)　🔶 僅完成選項 B 的 FAQ 區塊

單頁網站只有一個網址,難以針對不同主題分別排名。兩種做法擇一:

**選項 A(推薦,影響大)**:將主題拆為獨立頁面,各有獨立網址、`<h1>`、title、description:
- `/flute`(長笛教學)、`/piano`(鋼琴教學)
- `/courses`(課程與收費)、`/about`(師資)、`/contact`
- 拆完後同步更新 `sitemap.xml` 與導覽列。

**選項 B(輕量)**:保留單頁,但**新增部落格/文章區** `/blog/`,撰寫長尾內容,例:
- 「成人從零開始學長笛要注意什麼」
- 「鋼琴檢定怎麼準備」
- 「小孩幾歲適合學樂器」

並在頁面新增**可見的 FAQ 區塊**(與 Phase 3 的 FAQ JSON-LD 對應)。

> **執行狀態**:✅ 已完成選項 B 的「可見 FAQ 區塊」(3 題,與 JSON-LD 文字一致,並已加入頂部導覽列連結)。⬜ 拆頁(選項 A)、部落格 `/blog/` 尚未做。

**驗收**:新頁面皆可獨立開啟、各自有唯一 title/description、已加入 sitemap。

---

## 7. 完成驗收清單(Checklist)

- [x] `robots.txt` 與 `sitemap.xml` 已建立(本地;`https://` 線上存取待部署後確認)
- [x] `<head>` 含 canonical、viewport、charset
- [x] title / description 含「地區 + 樂器 + 客群」(地區=台北市中山區)
- [x] Open Graph 標籤齊全(og:image 用分享專用主視覺 `cover.jpg`)
- [x] 全頁僅一個 `<h1>`,區段為語意化 `<h2>`
- [~] 圖片有描述性 `alt` 與合理檔名 ✅;**WebP 壓縮未做** ⬜(環境無工具)
- [x] 頁面文字含地區/服務區域資訊(教室位置:中山區・行天宮捷運站步行 4 分鐘)
- [x] JSON-LD 本地驗證為合法 JSON ✅;**Rich Results Test / Schema Validator 需上線後執行** ⬜
- [~] (選做)FAQ 區塊 ✅;頁面拆分 / 部落格 ⬜
- [ ] Lighthouse SEO 與 Performance 分數檢視(行動版優先)— **需上線後執行** ⬜

---

## 8. 不屬於 Claude Code 範圍(需使用者本人操作)

以下需登入第三方帳號,Claude Code 不執行,僅提醒使用者完成:

1. ✅ **Google Search Console**(已完成 2026-06-09):已驗證擁有權、提交 `sitemap.xml`(狀態成功,探索到 1 頁)、對首頁要求建立索引(排入佇列,等 Google 實際收錄)。
2. ✅ **Google 商家檔案(Google Business Profile)**(已完成 2026-06-09):商家已上線可被搜到,類別=音樂教師、填入地區、描述、服務。
   - ⏳ 進行中:電話移除中(送審,最多 30 天)。
   - 🔁 長期持續:**累積 Google 評論**(對在地 SEO 影響最大)、補照片把 Profile strength 補滿。
3. ✅ **在地名錄/平台登錄**(已完成 2026-06-09):已登錄音樂教學平台(如 PRO360 等),取得曝光與外部連結。
4. ✅ **社群維護**(已完成 2026-06-09):YouTube / IG / Line 個人資料已放上網站連結;持續更新學生演出影片為長期項目。

---

## 9. 建議執行順序

1. ✅ **Phase 1**(收錄地基)— 已完成。
2. 🔶 **Phase 2**(On-page)— 大致完成,僅剩 WebP 壓縮。
3. ✅ **Phase 3**(結構化資料)— 已完成(電話/畢業學校欄位待補)。
4. ⬜ 提醒使用者完成 **第 8 節**(GSC + 商家檔案)— **待使用者操作**,愈早愈好。
5. 🔶 **Phase 4**(內容架構)— 已加 FAQ 區塊;拆頁/部落格視時間再做。

> **目前待辦**:① 補電話與畢業學校(JSON-LD,見 index.html TODO)② WebP 壓縮 ③ 上線後跑 Rich Results Test / Lighthouse ④ 第 8 節人工操作(GSC、Google 商家檔案等)。
