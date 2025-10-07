import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'onchain-fantasy-backend'
  });
});

export { router as healthRoutes };
