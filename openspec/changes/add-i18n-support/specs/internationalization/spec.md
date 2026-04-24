## ADDED Requirements

### Requirement: Multi-Language Support
The system SHALL support multiple UI languages, initially: Traditional Chinese (zh-TW), English (en), and Japanese (ja).

#### Scenario: Default language
- **WHEN** a user visits the application without a locale prefix
- **THEN** the system SHALL display the UI in Traditional Chinese (zh-TW)

#### Scenario: Language via URL prefix
- **WHEN** a user navigates to a URL with a locale prefix (e.g., `/en/dashboard`)
- **THEN** the system SHALL display the UI in the corresponding language

#### Scenario: Unsupported locale in URL
- **WHEN** a user navigates to a URL with an unsupported locale prefix
- **THEN** the system SHALL redirect to the default locale (zh-TW)

### Requirement: Language Switching
The system SHALL provide a language switcher UI in the navigation bar allowing users to change the display language.

#### Scenario: Switch language
- **WHEN** a user selects a different language from the language switcher
- **THEN** the UI language SHALL change immediately without a full page reload
- **AND** the URL SHALL update to reflect the new locale prefix

#### Scenario: Language switcher visibility
- **WHEN** a user is on any page (authenticated or unauthenticated)
- **THEN** the language switcher SHALL be visible and accessible

### Requirement: Language Preference Persistence
The system SHALL persist the user's language preference across sessions.

#### Scenario: Authenticated user preference
- **WHEN** an authenticated user switches language
- **THEN** the preference SHALL be saved to the user's database record
- **AND** subsequent visits SHALL use the saved preference

#### Scenario: Anonymous user preference
- **WHEN** an unauthenticated user switches language
- **THEN** the preference SHALL be saved to a cookie (`NEXT_LOCALE`)
- **AND** subsequent visits SHALL use the cookie preference

#### Scenario: Language detection priority
- **WHEN** a user visits the application
- **THEN** the system SHALL determine the language in this priority order:
  1. URL path locale prefix
  2. User database preference (if authenticated)
  3. `NEXT_LOCALE` cookie
  4. `Accept-Language` HTTP header
  5. Default (zh-TW)

### Requirement: Locale-Aware Formatting
The system SHALL format dates, numbers, and units according to the active locale.

#### Scenario: Date formatting
- **WHEN** the UI displays a date
- **THEN** the format SHALL match the active locale conventions (e.g., `2026/04/24` for zh-TW, `Apr 24, 2026` for en, `2026年4月24日` for ja)

#### Scenario: Number formatting
- **WHEN** the UI displays a number with units (weight, calories, etc.)
- **THEN** the number format SHALL use the locale's conventions (e.g., decimal separator)

### Requirement: Translation Completeness
The system SHALL display all UI text in the active language without untranslated strings.

#### Scenario: Fallback for missing translations
- **WHEN** a translation key is missing for the active locale
- **THEN** the system SHALL fall back to the zh-TW translation
- **AND** log a warning in development mode

#### Scenario: All user-facing text translated
- **WHEN** the system is displayed in any supported locale
- **THEN** all navigation items, page titles, form labels, buttons, status messages, empty states, and tooltips SHALL be in the active language

### Requirement: SEO Multi-Language Support
The system SHALL provide proper SEO signals for multi-language content.

#### Scenario: HTML lang attribute
- **WHEN** a page is rendered
- **THEN** the `<html>` tag SHALL have the correct `lang` attribute for the active locale

#### Scenario: Alternate hreflang links
- **WHEN** a page is rendered
- **THEN** the page SHALL include `<link rel="alternate" hreflang="...">` tags for all supported locales

#### Scenario: Localized metadata
- **WHEN** a page is rendered in a specific locale
- **THEN** the page `<title>` and `<meta name="description">` SHALL be in the active language

### Requirement: API Error Message Localization
The system SHALL return API error messages in the user's preferred language.

#### Scenario: Localized error response
- **WHEN** an API request fails
- **THEN** the error message in the response SHALL be in the language determined by the request's locale context (Accept-Language header or authenticated user preference)

#### Scenario: Error code stability
- **WHEN** an API returns an error
- **THEN** the error response SHALL include a language-independent error code alongside the localized message
