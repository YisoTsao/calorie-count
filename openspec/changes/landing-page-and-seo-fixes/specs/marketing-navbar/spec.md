## ADDED Requirements

### Requirement: 行銷 Navbar 顯示品牌名稱與導覽連結
系統 SHALL 在所有公開頁面頂部顯示行銷 Navbar，包含：品牌 Logo / 名稱、Navbar 連結（功能、價格）、語系切換器、「登入」連結及「立即開始」CTA 按鈕。

#### Scenario: 訪客訪問行銷頁面
- **WHEN** 未登入使用者訪問任何公開頁面
- **THEN** 顯示行銷 Navbar，右側含「登入」與「立即開始」按鈕

#### Scenario: 已登入使用者訪問行銷頁面
- **WHEN** 已登入使用者訪問行銷首頁
- **THEN** 系統 SHALL redirect 至 dashboard，不顯示行銷 Navbar

### Requirement: Navbar scroll 後切換樣式
系統 SHALL 在使用者 scroll 超過 80px 後，Navbar 由透明切換為磨砂玻璃（backdrop-blur）背景樣式。

#### Scenario: 頁面頂部
- **WHEN** 使用者位於頁面頂部（scroll < 80px）
- **THEN** Navbar 背景透明

#### Scenario: 向下 scroll
- **WHEN** 使用者 scroll 超過 80px
- **THEN** Navbar 顯示白色半透明磨砂玻璃背景（`bg-white/80 backdrop-blur-md`）

### Requirement: 行動版 Navbar 漢堡選單
系統 SHALL 在行動版（`< 768px`）顯示漢堡選單按鈕，點擊後展開全螢幕導覽選單，包含所有導覽連結與語系切換器。

#### Scenario: 行動版漢堡點擊
- **WHEN** 使用者點擊漢堡按鈕
- **THEN** 全螢幕選單以 Framer Motion slide-down 動畫展開
