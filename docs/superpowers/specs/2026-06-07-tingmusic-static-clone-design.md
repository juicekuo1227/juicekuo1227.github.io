# 聽聽音樂 靜態網站復刻 — 設計文件

- **日期**：2026-06-07
- **來源**：https://tingmusic.mystrikingly.com/ （Strikingly 單頁網站）
- **目標**：復刻成純靜態檔案（RWD），最底部聯絡表單改為 `mailto:` email 寄送方式

## 1. 目標與範圍

把原本架在 Strikingly 上的「聽聽音樂 庭羽老師 長笛/鋼琴教學」單頁網站，復刻成可獨立部署的純靜態網站：

- 視覺與內容貼近原站、具備 RWD（桌機 / 平板 / 手機）
- 零相依、零建置：vanilla HTML/CSS/JS，雙擊 `index.html` 即可開啟，也能直接部署到 GitHub Pages / Netlify 等靜態主機
- **核心改動**：最底部「與我聯絡」表單不再走 Strikingly 後端，改為前端組出 `mailto:` 連結，開啟使用者的郵件軟體寄信給 `juicekuo@gmail.com`

### 不做（Out of scope）
- 不複刻 Strikingly / PBS footer logo、cookie 同意橫幅、hCaptcha
- 不複刻嵌入式 Google Map iframe（地址改純文字，可選擇加一個 Google Maps 連結）
- 無後端、無資料庫、無表單伺服器

## 2. 技術方案

| 項目 | 選擇 |
|------|------|
| 技術 | Vanilla HTML5 + CSS3 + 原生 JS（無框架、無建置工具） |
| 檔案結構 | 分檔：`index.html` / `style.css` / `script.js` / `assets/` |
| 圖片 | 全部下載到本地 `assets/`（離線可用、最具可攜性） |
| 影片 | 4 個 YouTube `<iframe>` 嵌入（使用者提供連結） |
| 聯絡表單 | 前端 `mailto:` 預填，無後端 |

### 檔案結構
```
tingyumusic/
├─ index.html        # 語意化結構，9 個 section
├─ style.css         # CSS 變數 + 元件樣式 + RWD media queries
├─ script.js         # 漢堡選單、mailto 表單、平滑捲動
└─ assets/
   ├─ logo.png       # 音符 logo（來源 588796_945075.png）
   ├─ hero.jpg       # 學生合照（5A411A00-...jpg）
   ├─ teacher.png    # 師資照（237959_376269.png）
   ├─ icon-1.png ~ icon-5.png   # 5 張課程卡 icon
   └─ gallery-01.jpg ~ gallery-12.jpg  # 2025 發表會相片
```

## 3. 設計 Token（取自原站）

### 配色
| 用途 | 色碼 |
|------|------|
| 主背景 / 卡片 | `#FFFFFF` |
| 玫瑰灰區塊（師資、獲獎、聯絡） | `#E6DDDD` |
| 咖啡棕區塊（影片區） | `#9D8873` |
| 深色文字 | `#1D2023` |
| 咖啡棕區塊上的文字 | `#FFFFFF` / 淺色 |

### 字體
- 標題：`Averia Sans Libre`（Google Fonts）
- 中文內文：`PingFang TC`, `Microsoft JhengHei`, `微軟正黑體`, `STXihei`, sans-serif fallback
- 以 CSS 變數定義：`--font-display`、`--font-body`

## 4. 頁面區塊（依原站順序）

1. **Header（固定/置頂）** — logo 置中、右側「與我聯絡！」按鈕（錨點捲到聯絡區）。手機版：漢堡選單收合。
2. **Hero** — H1「聽聽音樂」、標語「♫長笛教學。♫鋼琴教學。♫音樂教材設計。♫上課紀錄」、學生合照大圖。
3. **師資介紹**（玫瑰灰底） — 圓形師資照 + 「郭庭羽 Aria Kuo」+ 兩段簡介 + 5 項資歷清單：
   - 通過 ABRSM 英國皇家音樂檢定 - ARSM 長笛演奏級
   - 通過 ABRSM 英國皇家音樂檢定 - 鋼琴 8 級
   - 通過 ABRSM 英國皇家音樂檢定 - 樂理 5 級
   - 文化盃長笛比賽 - 第一名
   - 希朵夫鋼琴比賽 - 第二名
4. **長笛 / 鋼琴教學** — 5 張課程卡（icon + 標題 + 說明）：幼兒音樂啟蒙 / 已有基礎的學生 / 成人初學 / 長笛團班 / 音樂檢定、比賽。桌機橫排，手機堆疊。
5. **學生演出精彩片段**（咖啡棕底） — 小標 + 「更多影片請至聽聽音樂 Youtube」連結（https://www.youtube.com/@ting-ting-music），4 個 YouTube 嵌入播放器，每個含標題與演出者：
   - Martin Cuellar : Toccata — 演出者：Kana — https://youtu.be/wnEmoi3gQ50
   - 柴可夫斯基：睡美人的華爾滋 — 演出者：Lily — https://youtu.be/tE8csMe-urU
   - 魔法公主 Princess mononoke — 演出者：Effie — https://youtu.be/sG395okhOy8
   - 威尼斯狂歡節 — 演出者：Daphne — https://youtu.be/k5kHF68hHME
6. **2025 郭老師音樂發表會** — 相片牆 grid（12 張）。桌機多欄，手機 2 欄。
7. **學生檢定、比賽獲獎紀錄**（玫瑰灰底） — 3 欄清單：檢定（14 筆）、比賽（4 筆）、音樂班/樂團（2 筆）。手機單欄堆疊。內容逐字取自原站快照。
8. **與我聯絡**（玫瑰灰底） — 兩欄：
   - 左：地址「行天宮捷運站 4 號出口步行 3 分鐘」、`Line ID : juicekuo`、email `juicekuo@gmail.com`（`mailto:` 連結）
   - 右：**mailto 表單**（見 §5）
9. **Footer** — `TingTingMusic © 2026`

## 5. 聯絡表單（核心改動）

保留三個欄位與送出按鈕，外觀與原站一致：
- 姓名（text）
- 電子信箱（email）
- 我想要學習.........（textarea）
- 送出（button）

**行為**：送出時 `script.js` 攔截，不送伺服器，改組出 `mailto:` 並導向：
- 收件人：`juicekuo@gmail.com`
- 主旨：`音樂課程詢問 - {姓名}`
- 內文（換行）：
  ```
  姓名：{姓名}
  回信信箱：{電子信箱}

  我想要學習：
  {訊息內容}
  ```
- 以 `encodeURIComponent` 編碼主旨與內文，組成 `mailto:juicekuo@gmail.com?subject=...&body=...`
- 透過 `window.location.href = mailtoUrl`（或建立 `<a>` 觸發）開啟預設郵件軟體

**驗證**：送出前做基本前端驗證（姓名與信箱非空、信箱格式）。欄位空白時顯示提示、不開信。

## 6. RWD 策略

行動優先的彈性版面，採 CSS Grid / Flexbox：
- **斷點**：`≤768px`（平板）、`≤480px`（手機）
- 導覽：手機版「與我聯絡！」收進漢堡選單
- 課程卡：桌機橫排（flex-wrap / grid auto-fit）→ 手機單欄
- 獲獎紀錄：桌機 3 欄 → 手機單欄
- 相片牆：桌機 4–6 欄 → 平板 3 欄 → 手機 2 欄
- 聯絡區：桌機左右兩欄 → 手機上下堆疊
- 圖片 `max-width:100%`、字級與 section padding 隨斷點縮放

## 7. 元件職責切分

- `index.html` — 純結構與內容，語意化標籤（`<header> <section> <footer>`），每個 section 有 `id` 供錨點
- `style.css` — 設計 token（`:root` 變數）+ 各 section 樣式 + RWD。單一檔案，依 section 分區註解
- `script.js` — 三個獨立小功能：
  1. `initMobileMenu()` — 漢堡開合
  2. `initContactForm()` — 攔截送出、組 mailto、前端驗證
  3. `initSmoothScroll()` — 錨點平滑捲動

各功能互不依賴，可單獨測試。

## 8. 驗收標準

- [ ] 9 個區塊內容與順序符合原站，文字逐字正確
- [ ] 桌機 / 平板（768px）/ 手機（375px）三種寬度版面正常、無破版、無水平捲動
- [ ] 圖片皆從本地 `assets/` 載入，離線（無網路）開啟仍可顯示（影片除外）
- [ ] 4 個 YouTube 影片可正常嵌入播放
- [ ] 聯絡表單送出可開啟郵件軟體，收件人/主旨/內文正確帶入，空欄位有驗證提示
- [ ] email 與 Line 區塊資訊正確，email 為可點的 `mailto:`
- [ ] 無 console error；無殘留 Strikingly / cookie / hCaptcha 元素

## 9. 已知待補
- 課程卡 icon 與發表會相片以本地下載版本為準；若某些 CDN 圖片下載失敗，於實作階段回報並改用替代圖或 placeholder。
