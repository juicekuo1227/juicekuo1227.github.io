# 聽聽音樂 Ting Ting Music — 官方網站

郭庭羽 Aria Kuo 長笛 / 鋼琴教學的單頁形象網站。純靜態（HTML / CSS / 原生 JS），**無框架、無建置工具**，雙擊 `index.html` 即可開啟。

## 線上網址

- 正式網域：<https://tingyumusic.com>
- GitHub Pages：<https://juicekuo1227.github.io>

## 專案結構（扁平）

| 檔案 / 資料夾 | 說明 |
|---|---|
| `index.html` | 頁面結構，9 個區塊（Header / Hero / 師資 / 課程 / 影片 / 相片牆 / 獲獎 / 聯絡 / Footer）|
| `style.css` | 設計 token（`:root` 變數）、版面、RWD 斷點（768 / 480）|
| `script.js` | 漢堡選單、平滑捲動、scrollspy 高亮、mailto 聯絡表單、相片燈箱、影片燈箱、footer 年份自動更新 |
| `assets/` | 本地圖片：`logo` / `hero` / `teacher`、課程 icon `icon-1~5`、相片牆原圖 `gallery-01~12`、臉部置中縮圖 `thumb-01~12` |
| `CNAME` | GitHub Pages 自訂網域設定（`tingyumusic.com`）|
| `.nojekyll` | 告訴 Pages 跳過 Jekyll 處理（純靜態）|
| `docs/` | 設計規格與實作計畫（`docs/superpowers/specs`、`docs/superpowers/plans`）|

> 圖片全部存在本地 `assets/`，離線也能顯示；只有 YouTube 影片與其縮圖需要連網。

## 本地預覽

```bash
cd tingyumusic
python3 -m http.server 8000
# 開瀏覽器：http://localhost:8000
```

（直接雙擊 `index.html` 也可以，但用本機伺服器較接近線上行為。）

## 部署

`main` 分支就是線上版。**push 到 `main` → GitHub Pages 自動重新部署**（約 1–2 分鐘生效），更新 `tingyumusic.com`。

```bash
git add -A
git commit -m "..."
git push            # 自動上線
```

純靜態網站採「Deploy from a branch」模式，**不需要 GitHub Action**。

## 版本管理工作流程（新設計版本）

`main` 永遠代表「目前線上版」。要做新的設計版本時，在分支上開發，完成驗證後再合回 `main` 上線，舊版用 git tag 保存。

1. 從最新的 `main` 開一個設計分支：
   ```bash
   git switch main && git pull
   git switch -c design/v2
   ```
2. 在分支上開發，並用 `python3 -m http.server` 本地預覽。
3. 完成且驗證 RWD / 燈箱 / 表單後，合回 `main` 上線：
   ```bash
   git switch main
   git merge design/v2
   git push            # 自動部署到 tingyumusic.com
   ```
4. 標記這個版本里程碑：
   ```bash
   git tag -a v2 -m "v2 設計上線"
   git push origin v2
   ```

舊版隨時可由 tag 取回參考或還原：

```bash
git switch -c restore-v1 v1     # 從 v1 tag 開出一個分支
```

## 版本歷史

- **v1** — 復刻原 Strikingly 站：完整 9 區塊、RWD、mailto 聯絡表單、相片 / 影片燈箱、手機全選單 + scrollspy、滿版 hero、臉部置中縮圖、footer 社群連結（YouTube / Instagram / LINE）、自訂網域 `tingyumusic.com`。
