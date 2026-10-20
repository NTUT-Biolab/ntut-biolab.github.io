# NTUT 生醫資訊實驗室網站

網址：https://ntut-biolab.github.io（英文版：https://ntut-biolab.github.io/en/）

本站使用 GitHub Pages 內建的 [Jekyll](https://jekyllrb.com/) 建置。推送到 `main` 後約 1–2 分鐘自動更新，不需要額外設定。

## 常見維護工作

大部分內容都放在 `_data/` 的 YAML 資料檔裡，中英文頁面共用同一份資料，改一次兩邊都會更新。

| 想做的事 | 修改的檔案 |
| --- | --- |
| 新增畢業生／論文 | `_data/alumni.yml`（新學年度加在最上面） |
| 新增研究計畫 | `_data/projects.yml`（加在最上面；執行中填 `status: ongoing`） |
| 更新課程 | `_data/courses.yml` |
| 更新主持人經歷 | `_data/cv.yml` |
| 修改研究領域介紹 | `_data/research.yml`（圖片：`assets/img/research-<slug>.jpg`） |
| 修改資源連結 | `_data/links.yml` |
| 修改免責聲明 | `_data/disclaimer.yml` |
| 修改電話、信箱、地址、維護者 | `_config.yml` |
| 修改導覽列 | `_data/nav.yml` |
| 修改頁首／頁尾文字 | `_data/ui.yml` |

首頁的「畢業研究生」「研究計畫」數量會依資料檔自動計算，「年研究耕耘」由 `_config.yml` 的 `lab.founded` 自動計算。

### 範例：新增一位畢業生

```yaml
- year: 115
  graduates:
  - degree: ms            # phd 或 ms
    name: 王小明
    name_en: Hsiao-Ming Wang
    thesis: 論文中文題目
    thesis_en: English Thesis Title
```

### 範例：新增一項研究計畫

```yaml
- title: 計畫中文名稱
  title_en: English project title
  code: NSTC 114-2221-E-027-XXX
  role: pi                # pi 或 co-pi
  period: 114/08 ~ 115/07
  period_en: 2025/08 – 2026/07
  agency: 國科會
  agency_en: NSTC
  status: ongoing         # 結案後刪除此行
```

## 檔案結構

```
_config.yml          網站設定、聯絡資訊
_data/               內容資料（上表）
_layouts/default.html 共用版型（<head>、頁首、頁尾）
_includes/           共用元件（研究卡片、畢業生表格、計畫列表等）
index.html …         中文頁面（沿用舊網址：PRoject.htm、labmembers.htm 等）
en/                  英文頁面
style.css, main.js   樣式與互動
assets/img/          網站圖片
```

## 本機預覽（選用）

需要 Ruby：

```bash
bundle install
bundle exec jekyll serve
# 開啟 http://localhost:4000
```

## Google Search Console

1. 到 [Google Search Console](https://search.google.com/search-console) 新增資源，選「網址前置字元」並輸入 `https://ntut-biolab.github.io/`。
2. 驗證方式選「HTML 標記」，複製 `content="..."` 裡的驗證碼，貼到 `_config.yml` 的 `google_site_verification`，推送後回到 Search Console 按「驗證」。
3. 驗證成功後，在「Sitemap」提交 `sitemap.xml`（由 jekyll-sitemap 自動產生）。
