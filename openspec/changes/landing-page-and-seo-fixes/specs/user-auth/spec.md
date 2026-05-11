## MODIFIED Requirements

### Requirement: 登出後 redirect 至當前語系登入頁
系統 SHALL 在使用者登出後，redirect 至使用者**登出前所在語系**的登入頁（`/{locale}/login`），而非固定 redirect 至預設語系的登入頁。

#### Scenario: 繁體中文使用者登出
- **WHEN** 使用 zh-TW 語系的使用者點擊登出
- **THEN** redirect 至 `/zh-TW/login`

#### Scenario: 英文介面使用者登出
- **WHEN** 使用 en 語系的使用者點擊登出
- **THEN** redirect 至 `/en/login`

#### Scenario: 日文介面使用者登出
- **WHEN** 使用 ja 語系的使用者點擊登出
- **THEN** redirect 至 `/ja/login`
