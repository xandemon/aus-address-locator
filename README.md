# Australian Address Locator

A single-page application built with Next.js that allows users to verify Australian addresses and search for locations using the Australia Post API.

## 🚀 Features

- **Tab Navigation**
- **Address Validator**
- **Location Search**
- **Google Maps Integration**
- **Elasticsearch Logging**
- **State Persistence**
- **GraphQL Proxy**
- **Form Validation with Zod**
- **Type-safe with TypeScript**

## 🛠 Technology Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context with localStorage persistence
- **GraphQL**: Apollo Client with Apollo Server
- **Validation**: Zod schemas
- **Icons**: Lucide icons

## 📁 Project Structure

```
aus-address-locator/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── graphql/             # GraphQL endpoint
│   │   ├── verify-address/      # Address verification REST API
│   │   └── search-locations/    # Location search REST API
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application page
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── alert.tsx
│   ├── tabs.tsx                 # Tab navigation system
│   ├── verifier-tab.tsx         # Address verification form
│   └── source-tab.tsx           # Location search interface
├── context/                      # React context providers
│   └── app-context.tsx          # Main application state
├── lib/                         # Utilities and services
│   ├── graphql/                 # GraphQL schemas and queries
│   ├── services/                # External API services
│   ├── schemas.ts               # Zod validation schemas
│   ├── persistence.ts           # State persistence utilities
│   ├── utils.ts                 # Common utility functions
│   └── apollo-client.ts         # Apollo Client configuration
└── config/                      # Configuration files
    └── env.ts                   # Environment configuration
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for authentication and elastic search

### 1. Clone and Install

```bash
git clone https://github.com/xandemon/aus-address-locator.git
cd aus-address-locator
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Keys
AUSTRALIA_POST_API_KEY=your_australia_post_api_key_here

# Australia Post API
AUSTRALIA_POST_BASE_URL=your_australia_post_base_url_here

# Elasticsearch Configuration
ELASTICSEARCH_NODE=your_elastic_search_node
ELASTICSEARCH_API_KEY=you_elastic_search_api_key_here
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 📊 Elasticsearch Logging & Analytics

The application includes comprehensive logging functionality and logging is done as mentioned below:

- **Verifier Tab**: All valid address verification (input + results)
- **Source Tab**: Location selections only (search query + selected location)
- **Metadata**: Timestamps, IP addresses, user agents

## 🧪 Testing the Application

### Address Verifier Tab

Test with these valid combinations:

- Postcode `3000`, Suburb `Melbourne`, State `VIC`
- Postcode `3156`, Suburb `Ferntree Gully`, State `VIC`
- Postcode `4000`, Suburb `Brisbane`, State `QLD`

Test invalid combinations:

- **Invalid match**: Postcode `2000`, Suburb `Broadway`, State `NSW`
- **Wrong state**: Postcode `2000`, Suburb `Sydney`, State `VIC`

### Source Tab

- Search by suburb: `Sydney`, `Melbourne`, `Brisbane`
- Use category filters to narrow results (there are 2 static categories at the moment, but they can be made dynamic from the search results based on the available categories)

## 💾 State Persistence

The application automatically saves:

- Active tab selection
- Form inputs in both tabs
- Search results and selected locations
- Validation results

Data persists across browser sessions using localStorage with proper error handling and validation.

Type is strictly enforced in the persisted data, therefore, if there are cases where the state is not persisted, check the console for `Invalid saved state` warning.

## 🎨 UI Components

- Built from scratch without any component libraries
- Responsive design for mobile and desktop

## ✨ Future Improvements

- Skeleton loading and fluent animations
- Testing with Jest or other testing libraries
- More UX improvements and refactoring
