# AI 食物卡路里辨識系統 - 專案概述

## Purpose
一套完整的 AI 識別食物卡路里 Web 應用程式，協助使用者透過拍照追蹤飲食、管理營養攝取，並達成健康目標。

## Tech Stack

### 前端
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod validation
- Recharts for data visualization

### 後端
- Next.js API Routes
- PostgreSQL database
- Prisma ORM
- NextAuth.js (Email/Google/Apple OAuth)
- Uploadthing for file storage

### AI & Services
- OpenAI GPT-4 Vision API (food recognition)
- Vercel deployment
- Supabase/Neon database hosting

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled, explicit types, no `any`
- **Naming**: PascalCase for components, camelCase for functions, kebab-case for files
- **File Structure**: Feature-based organization (auth, meal, analytics, social)
- **Imports**: Absolute imports with `@/` prefix

### Architecture Patterns
- **API Design**: RESTful with standard response format `{ success, data, error }`
- **Authentication**: JWT-based with NextAuth.js
- **State Management**: React Hooks + Context API / Zustand for global state
- **Error Handling**: Centralized error handling, friendly user messages
- **Validation**: Zod schemas for both client and server

### Testing Strategy
- Unit tests: Jest + React Testing Library (70% coverage target)
- E2E tests: Playwright for critical flows
- API tests: Postman collection
- Type safety: TypeScript as first line of defense

### Git Workflow
- Main branch: `main` (production)
- Development branch: `develop`
- Feature branches: `feature/description`
- Conventional commits: `type(scope): message`

## Domain Context

### Core Capabilities
1. **User Authentication** - Login, register, OAuth, password management
2. **Food Recognition** - AI-powered photo analysis, nutrition calculation
3. **Meal Records** - Daily food diary, meal categorization (breakfast/lunch/dinner/snack)
4. **Nutrition Tracking** - Calories, macros, water intake, weight tracking
5. **Analytics** - Trends, charts, goal progress, achievements
6. **Food Database** - Searchable food library, brands, restaurants
7. **Social Features** - Posts, friends, leaderboard

### User Flow
1. User takes photo or uploads image
2. AI identifies food items with confidence scores
3. User confirms/edits portions and nutrition
4. System saves to meal record
5. Dashboard shows daily progress vs goals
6. Weekly/monthly analytics and insights

### Data Model Key Entities
- User (profile, goals, preferences)
- MealRecord (date, type, items, totals)
- FoodItem (name, nutrition, serving)
- RecognitionResult (image, detected items, confidence)
- DailySummary (aggregated nutrition, water, exercise)

## Important Constraints

### Performance
- Image upload max 5MB, compressed to 2MB
- AI recognition response < 5 seconds
- API response time < 200ms (p95)
- Lighthouse score > 90

### Security
- All API routes require authentication (except public endpoints)
- CSRF protection enabled
- Rate limiting: 100 req/min per user
- Sensitive data encrypted at rest
- Input validation on both client and server

### Business Rules
- Free tier: 30 photo recognitions/month
- Premium tier: Unlimited + advanced analytics
- Data retention: 1 year for free users, unlimited for premium

## External Dependencies

### Critical Services
- **OpenAI API**: Food recognition (fallback: manual entry)
- **Authentication**: NextAuth.js with multiple providers
- **Database**: PostgreSQL (Supabase/Neon)
- **File Storage**: Uploadthing (images, exports)
- **Email**: Resend (verification, notifications)

### API Rate Limits
- OpenAI: 3 requests/min (vision API)
- Google OAuth: Standard limits
- Database: Connection pool size 20

### Monitoring
- Error tracking: Sentry
- Analytics: Vercel Analytics
- Logging: Console + structured logs
