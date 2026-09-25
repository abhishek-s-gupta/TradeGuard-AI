import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import geminiRouter from './routes/gemini';

// Initialize dotenv configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup to allow the frontend to access the API endpoints
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// GET /api/health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TradeGuard AI API'
  });
});

// Mount routes
app.use('/api', geminiRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[TradeGuard Server] Running on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Warning] process.env.GEMINI_API_KEY is not defined. Server will fall back to local rule-based text generation.');
  }
});
