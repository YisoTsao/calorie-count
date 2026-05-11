## MODIFIED Requirements

### Requirement: 所有語系路由統一帶 locale 前綴
系統 SHALL 使用 `localePrefix: 'always'`，使所有語系（含預設語系 zh-TW）的路由均帶有 locale 前綴：
- zh-TW：`/zh-TW/login`（原 `/login`）
- en：`/en/login`（不變）
- ja：`/ja/login`（不變）

#### Scenario: zh-TW 使用者訪問 /login（舊 URL）
- **WHEN** 使用者訪問舊路徑 `/login`
- **THEN** 系統 SHALL 301 redirect 至 `/zh-TW/login`

#### Scenario: 已更新語系的路由正常訪問
- **WHEN** 使用者訪問 `/zh-TW/login`
- **THEN** 正常顯示登入頁，無 redirect

### Requirement: hreflang 與 canonical 正確指向語系 URL
系統 SHALL 在所有語系頁面的 `generateMetadata` 輸出的 hreflang alternates 中使用帶前綴的完整 URL（含 `zh-TW` 前綴）。

#### Scenario: sitemap 中的 zh-TW URL
- **WHEN** Google 爬取 `/sitemap.xml`
- **THEN** zh-TW 條目的 URL 格式為 `https://calo-circle.yisoapp.com/zh-TW/login`

#### Scenario: hreflang 自我引用
- **WHEN** Google 爬取 `/zh-TW/login`
- **THEN** 頁面 `<head>` 包含 `<link rel="alternate" hreflang="zh-TW" href="https://calo-circle.yisoapp.com/zh-TW/login" />` 以及其他語系的對應條目
