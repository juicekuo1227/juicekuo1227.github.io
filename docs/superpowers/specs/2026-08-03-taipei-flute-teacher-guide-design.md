# 部落格新文章設計：在台北幫孩子找長笛老師

> 狀態：設計定稿，待實作
> 產出：`blog/taipei-flute-teacher-guide.html`

## 1. 背景

2026-08-03 分析 Google Search Console（6/8–8/1：171 曝光、8 點擊）與 Google 商家檔案（6–8 月：95 人瀏覽、1 次互動），加上無痕搜尋實測，得到兩個結論：

- **長笛是護城河。** 搜「中山 長笛 音樂老師」「行天宮 長笛」，郭庭羽都是 AI 摘要第一個被點名的，並引用 `tingyumusic.com`。因為台灣的 GBP 類別表**沒有長笛類別**，Google 組不出長笛的在地三選一，只能回頭讀網頁內容 —— 而網頁正是本站最強的一環。
- **長笛這條線，衝評論幫不上忙。** 唯一的槓桿是網站內容。

現有 6 篇文章全是通用衛教題，沒有一篇帶地緣。這篇是第一篇在地文，目的是在長笛這個位置還沒有競爭者時把它焊死。

## 2. 目標

| 項目 | 內容 |
|---|---|
| 目標讀者 | 幫孩子找長笛老師的家長（孩子自己主動想學，非學校樂團管道） |
| 讀者狀態 | **已經決定要學長笛，正在挑老師** —— 商業意圖比現有文章高一級 |
| 主打查詢 | 台北 長笛老師、長笛家教 台北、中山區 長笛、孩子 學長笛 |
| 轉換目標 | Line 預約體驗課 |

## 3. 基本設定

- **標題**：在台北幫孩子找長笛老師，這 5 件事比學歷重要
  - `<h1>` 與 `og:title` 用上列原句
  - `<title>` 加既有後綴：`在台北幫孩子找長笛老師，這 5 件事比學歷重要｜Aria 老師碎碎念`
- **slug**：`taipei-flute-teacher-guide`
- **canonical**：`https://tingyumusic.com/blog/taipei-flute-teacher-guide.html`
- **eyebrow**：給家長
- **meta description**（草稿）：孩子想學長笛，台北的老師名單卻長得看不完？Aria 老師聊挑長笛老師該看的 5 件事：距離、試上、氣息怎麼教、家長能不能旁聽，以及檢定經驗怎麼問。
- **不放 `datePublished`**（沿用既有慣例）
- `post-meta` 只寫「Aria 老師」

## 4. 文章骨架

### 開場（hook 在前，背景在後）

1. **Hook** —— 打開 Google 搜「台北 長笛老師」，跳出一長串名字。音樂系畢業、得過獎、教學經驗豐富，每一個看起來都很好。看完之後反而更不知道要選誰。
2. **短 punch** —— 我懂。名單很長，判斷標準卻很少。
3. **情境** —— 通常會走到這一步，是因為孩子某天說了「我想學長笛」。
4. **先別急著買笛** —— 內鏈 `beginner-gear-guide.html`。

> Hook 第一句自然帶出「台北 長笛老師」目標關鍵字，因為那本來就是讀者剛打的字，不是硬塞。

### 先講結論（`.answer` 區塊）

把 5 點濃縮成三行，讓趕時間的家長五秒拿到答案。核心主張：**最該看的不是學歷，是孩子上不上得下去。**

### 五個編號 H2

沿用 `kids-wont-practice.html` 已驗證的 pattern（`方法一：…`），本篇用「重點一：」。

| # | H2 | 內容重點 |
|---|---|---|
| 一 | 老師離家近不近，比你想的更重要 | 一週一次、要撐兩年，接送是真實成本。**語氣放軟**：承認確實有值得跑遠路的老師，只是請先把接送算進去。地緣自然進場（捷運動線） |
| 二 | 先上一堂再決定，不要一次買一季 | 拆掉家長的決策壓力；願不願意讓你試上，本身就是訊息 |
| 三 | 問問老師怎麼教長笛的「氣息」 | **全篇靈魂**。長笛專屬，外行寫不出來，最能分辨真懂假懂 |
| 四 | 家長能不能旁聽？課後有沒有回饋？ | 家長最在意、但最不好意思開口問的一題 |
| 五 | 打算考檢定，就問老師實際帶過幾個 | Aria 的真實強項（以檢定為主、比賽很少），也是全篇唯一提到自己的地方 |

### 收尾 H2（非編號）

「那，第一堂長笛課會發生什麼？」—— 拆掉不確定感，鋪向體驗課。照 `kids-wont-practice.html` 的收法。

### 常見問題（4 題，含 `FAQPage` JSON-LD）

1. 孩子幾歲可以開始學長笛？（換完牙、約 8 歲以上；門牙位置與肺活量）
2. 學長笛一定要先買一支長笛嗎？（不必，先租或先借，讓興趣撐過前幾個月）
3. 長笛課一週上幾次比較好？（初學一週一次即可，重點在課後有沒有碰）
4. 學長笛一定要考檢定嗎？（不一定；檢定是工具不是目的，想要一個階段性目標時才用）

### 結尾元件（沿用既有）

- `.callout` 快速重點 —— 5 條，對應 5 個重點
- `.cta` —— Line 預約，`https://line.me/R/ti/p/%40897rgmut`
- `.related` 延伸閱讀 —— `choosing-first-instrument.html`、`beginner-gear-guide.html`

## 5. 地緣密度規則

只出現三處，不硬塞：

1. **標題**：台北
2. **重點一**：講捷運動線與接送成本（通用原則，不指名自己）
3. **CTA 附近**：具體寫「教室在中山區，行天宮站步行 4 分鐘」

密度足夠讓 Google 讀懂地緣，但讀者不會覺得在看廣告。

## 6. 誠實度原則

**前四個重點完全不提自己**，而且「重點一」等於勸退住得遠的家長。這是刻意的設計：

- 家長讀得出誰在賣課、誰在給建議
- 這也正是 Google 目前偏好的內容型態
- 只有「重點五」自然帶到 Aria 的檢定經驗

## 7. 與現有文章的關係

不重疊，並補上一條漏斗：

```
choosing-first-instrument（還在選樂器）
        ↓ 選定長笛
   本篇（正在找老師）→ Line
        ↕
beginner-gear-guide（要不要買笛）
```

「幾歲開始」「要不要先買笛」原本規劃成獨立 H2，因為標題採數字型、整篇必須以 5 點為骨幹，**改放進開場與 FAQ**，正好避開與上述兩篇的重疊。

需在 `choosing-first-instrument.html` 補一條內鏈導向本篇。

## 8. 插畫

用 `scripts/gen-illustration.sh "<英文主體描述>" <輸出.png>`，輸出至 `assets/blog/taipei-flute-teacher-guide/`。

| 檔案 | 主體描述（英文） | 放置位置 |
|---|---|---|
| `cover.png` | a parent and a child looking at a flute together in a warm music studio | 開場後 |
| `inline-1.png` | a child learning breath control with a flute, teacher guiding gently | 重點三 |
| `inline-2.png` | a parent sitting quietly at the back of a music room watching a child's flute lesson | 重點四 |

## 9. 寫作規範

依 `CLAUDE.md`「部落格寫作慣例」：

- 朋友口吻、第二人稱「你」、帶 Aria 第一人稱視角、幾乎不用 emoji、不誇大、不寫死價格
- 句子長短落差要大；長句鋪陳後接 2~5 字的短句；避免兩個等長並排子句
- 單段上限約 120 字，punch 短句可獨立成段
- 中文內文一律全形標點

**標題不用第一人稱**（「我會先看」讀起來自大，且焦點錯置在老師身上而非讀者的判斷標準）。

## 10. 待 Aria 校訂

- **重點三（氣息怎麼教）** —— 先由 Claude 依一般長笛教學常識寫草稿，Aria 再改成實際教法。此段是全篇專業展示區，草稿內容不得視為定稿。
- FAQ 第 1 題的年齡數字，與 `choosing-first-instrument.html` 現有說法（換完牙、約 8 歲以上）保持一致；若 Aria 的實際判斷不同，兩篇要一起改。

## 11. 產出清單

1. `blog/taipei-flute-teacher-guide.html`（新檔）
2. `assets/blog/taipei-flute-teacher-guide/cover.png`、`inline-1.png`、`inline-2.png`（新檔）
3. `blog/index.html` —— 加文章卡片
4. `sitemap.xml` —— 加 URL
5. `blog/topics.md` —— 新增「在地主題」區塊並記錄本篇
6. `choosing-first-instrument.html` —— 補內鏈導向本篇

## 12. 驗收方式

- `python3` 解析 JSON-LD，確認 `Article` 與 `FAQPage` 皆為合法 JSON、無 `datePublished`
- `python3` 解析 `sitemap.xml`，確認為合法 XML 且含新 URL
- 本機 `python3 -m http.server 8731` 預覽，確認版型、圖片路徑、內鏈與 Line CTA 皆正常
- 全文檢查：中文相鄰處無半形標點；單段字數不超過約 120 字
- 確認 `blog/index.html` 卡片連結可點達
