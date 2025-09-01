import express from 'express';
import cors from 'cors';
import { rateLimitMiddleware } from './src/lib/middleware/rateLimit';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api', rateLimitMiddleware);

// Example protected route
app.get('/api/protected', (req, res) => {
  res.json({ message: 'This is a rate-limited endpoint' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
