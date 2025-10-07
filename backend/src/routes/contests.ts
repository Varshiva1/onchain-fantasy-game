import { Router } from 'express';

const router = Router();

// Mock data - in production this would come from a database
const sports = [
  { id: 'cricket', name: 'Cricket' },
  { id: 'football', name: 'Football' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'hockey', name: 'Hockey' },
  { id: 'badminton', name: 'Badminton' },
];

const contests = [
  {
    id: '1',
    sport: 'cricket',
    name: 'Cricket World Cup 2024',
    entry_fee: 10000000000000000, // 0.01 ETH in wei
    prize_pool: 100000000000000000, // 0.1 ETH in wei
    status: 'active',
    participants: 0,
    max_participants: 100,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    sport: 'football',
    name: 'Premier League Fantasy',
    entry_fee: 20000000000000000, // 0.02 ETH in wei
    prize_pool: 200000000000000000, // 0.2 ETH in wei
    status: 'active',
    participants: 0,
    max_participants: 50,
    created_at: new Date().toISOString()
  }
];

router.get('/sports', (req, res) => {
  res.json({ sports });
});

router.get('/', (req, res) => {
  const { sport } = req.query;
  
  let filteredContests = contests;
  if (sport) {
    filteredContests = contests.filter(c => c.sport === sport);
  }
  
  res.json({ contests: filteredContests });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const contest = contests.find(c => c.id === id);
  
  if (!contest) {
    return res.status(404).json({ error: 'Contest not found' });
  }
  
  res.json({ contest });
});

export { router as contestRoutes };
