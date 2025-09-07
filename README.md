# LinkBird UI

A modern, full-stack CRM and lead management application built with Next.js 15, featuring campaign management, lead tracking, and LinkedIn integration capabilities.

## Features

### Core Functionality
- **Campaign Management**: Create, manage, and track marketing campaigns
- **Lead Management**: Comprehensive lead tracking with status management
- **Dashboard Analytics**: Real-time insights and performance metrics
- **User Authentication**: Secure login with email/password and Google OAuth
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Real-time Updates**: Live data synchronization with TanStack Query

### User Interface
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Theme Support**: Dark and light mode with system preference detection
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive Components**: Smooth animations and transitions
- **Sidebar Navigation**: Collapsible sidebar with smooth transitions

### Data Management
- **Campaign Tracking**: Monitor campaign performance with lead counts and response rates
- **Lead Status Management**: Track leads through pending → contacted → responded → converted
- **Search & Filtering**: Advanced search and filtering capabilities
- **Sorting**: Multi-column sorting for campaigns and leads
- **Pagination**: Efficient data loading with infinite scroll

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **TanStack Query** - Data fetching and caching
- **Lucide React** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Better Auth** - Modern authentication library
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Robust relational database
- **Neon DB** - Serverless PostgreSQL hosting

### Development Tools
- **ESLint** - Code linting and formatting
- **Drizzle Kit** - Database migrations and studio
- **TypeScript** - Static type checking

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon DB account)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd linkbird-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/linkbird"
   
   # Authentication
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3001"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # API
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```

4. **Set up the database**
   ```bash
   # Generate database schema
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data (optional)
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── campaigns/     # Campaign management
│   │   └── leads/         # Lead management
│   ├── campaigns/         # Campaign pages
│   │   ├── [id]/          # Campaign details
│   │   └── page.tsx       # Campaigns list
│   ├── dashboard/         # Dashboard page
│   ├── leads/             # Leads page
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components (Sidebar, etc.)
│   └── leads/             # Lead-specific components
├── hooks/                 # Custom React hooks
│   └── queries/           # TanStack Query hooks
├── lib/                   # Utility libraries
│   ├── api.ts             # API client functions
│   ├── auth.ts            # Authentication configuration
│   ├── db.ts              # Database connection
│   └── schema.ts          # Database schema
└── stores/                # Zustand state stores
    ├── authStore.ts       # Authentication state
    ├── themeStore.ts      # Theme management
    └── uiStore.ts         # UI state (sidebar, modals)
```

## API Endpoints

### Authentication
- `POST /api/auth/sign-in` - Email/password login
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in/social` - Social login (Google)
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/me` - Get current user

### Campaigns
- `GET /api/campaigns` - Get all campaigns for user
  - Query params: `status` (draft|active|paused|completed)
- `GET /api/campaigns/[id]` - Get specific campaign details
- `PATCH /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `GET /api/campaigns/[id]/leads` - Get leads for specific campaign

### Leads
- `GET /api/leads` - Get all leads for user
  - Query params: `status`, `search`, `limit`, `page`
- `GET /api/leads/[campaignId]` - Get leads for specific campaign

### Utility
- `GET /api/test-db` - Test database connection
- `GET /api/test-auth` - Test authentication setup

## Database Schema

### Core Tables

#### Users
```sql
user (
  id: text (primary key)
  name: text
  email: text (unique)
  emailVerified: boolean
  image: text
  createdAt: timestamp
  updatedAt: timestamp
)
```

#### Campaigns
```sql
campaigns (
  id: serial (primary key)
  name: varchar(160)
  status: campaign_status (draft|active|paused|completed)
  totalLeads: integer
  successfulLeads: integer
  responseRate: integer
  userId: text (foreign key)
  createdAt: timestamp
)
```

#### Leads
```sql
leads (
  id: serial (primary key)
  name: varchar(160)
  email: varchar(160)
  company: varchar(160)
  designation: varchar(160)
  status: lead_status (pending|contacted|responded|converted)
  campaignId: integer (foreign key)
  userId: text (foreign key)
  createdAt: timestamp
  updatedAt: timestamp
)
```

## UI Components

### Layout Components
- **Sidebar**: Collapsible navigation with theme toggle
- **Header**: Page headers with search and filters
- **Modal**: Reusable modal component

### Dashboard Components
- **CampaignsList**: Campaign overview with filtering
- **LeadsList**: Recent leads with status indicators

### Lead Components
- **LeadProfileModal**: Detailed lead information
- **LeadStatusBadge**: Status indicators with colors

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run seed         # Seed database with sample data
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
BETTER_AUTH_SECRET="your-production-secret"
BETTER_AUTH_URL="https://your-domain.com"
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
NEXT_PUBLIC_API_URL="https://your-domain.com"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Better Auth](https://better-auth.com/) for modern authentication
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- [TanStack Query](https://tanstack.com/query) for data fetching and caching

---

**Built with modern web technologies**
