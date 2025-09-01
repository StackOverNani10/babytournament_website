# Detallazo Website

A modern event management platform built with Next.js and Supabase.

## Features

- **Row Level Security (RLS)**: Secure data access control at the database level
- **Real-time Updates**: Live subscriptions to data changes
- **Caching Layer**: Improved performance with in-memory caching
- **Input Validation**: Robust data validation with Zod schemas
- **Rate Limiting**: Protection against brute force attacks
- **XSS Protection**: Built-in sanitization of user inputs
- **Comprehensive Testing**: Unit and integration tests
- **Type Safety**: Full TypeScript support with generated types

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account and project
- Environment variables (see `.env.example`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Update the environment variables with your Supabase credentials

### Development

```bash
# Start the development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run type checking
npm run type-check
```

## Database

The database schema is managed through Supabase migrations. To apply migrations:

```bash
# Apply all migrations
npx supabase migration up

# Create a new migration
npx supabase migration new migration_name
```

## API Documentation

### Data Service

The `dataService` provides methods to interact with the database:

```typescript
// Fetch all items from a table
const items = await dataService.fetchAll('table');

// Fetch a single item by ID
const item = await dataService.fetchById('table', 'item-id');

// Create a new item
const newItem = await dataService.create('table', { name: 'New Item' });

// Update an item
const updatedItem = await dataService.update('table', 'item-id', { name: 'Updated' });

// Delete an item
const success = await dataService.delete('table', 'item-id');

// Subscribe to changes
const channel = await dataService.subscribe('table', 'INSERT', 'event_id=eq.1', (payload) => {
  console.log('Change received:', payload);
});
```

### Rate Limiting

Rate limiting is applied to all API routes. The default limit is 100 requests per minute per IP address.

### Input Validation

All user inputs are validated using Zod schemas. Invalid inputs will return a 400 status code with validation errors.

## Security

- Row Level Security (RLS) is enabled on all tables
- Input sanitization is applied to prevent XSS attacks
- Rate limiting protects against brute force attacks
- Sensitive data is not exposed in API responses

## Testing

Tests are written with Jest and can be run with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

## Deployment

The application can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

## License

MIT
