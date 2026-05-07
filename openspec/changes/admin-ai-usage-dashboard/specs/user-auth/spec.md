## MODIFIED Requirements

### Requirement: Admin Navigation
管理後台導覽 SHALL 提供 AI 用量頁面入口，僅 ADMIN 角色可見。

#### Scenario: ADMIN 角色看到 AI 用量導覽
- **WHEN** ADMIN 角色使用者進入管理後台
- **THEN** 側邊欄顯示「AI 用量」項目，連結至 `/admin/ai-usage`

#### Scenario: 低權限角色不見 AI 用量導覽
- **WHEN** SUPPORT / EDITOR 角色使用者進入管理後台
- **THEN** 側邊欄不顯示「AI 用量」項目
