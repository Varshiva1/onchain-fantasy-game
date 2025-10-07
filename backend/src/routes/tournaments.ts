import { Router } from 'express';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Mock tournaments data - in production this would come from a database
let tournaments = [
  {
    id: '1',
    name: 'Cricket World Cup 2024',
    sport: 'cricket',
    entry_fee: '0.01',
    prize_pool: '0.1',
    status: 'active',
    participants: 0,
    max_participants: 100,
    contract_address: '0x1234567890123456789012345678901234567890',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Premier League Fantasy',
    sport: 'football',
    entry_fee: '0.02',
    prize_pool: '0.2',
    status: 'active',
    participants: 0,
    max_participants: 50,
    contract_address: '0x2345678901234567890123456789012345678901',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Tennis Grand Slam',
    sport: 'tennis',
    entry_fee: '0.005',
    prize_pool: '0.05',
    status: 'active',
    participants: 0,
    max_participants: 200,
    contract_address: '0x3456789012345678901234567890123456789012',
    created_at: new Date().toISOString()
  }
];

// Get all tournaments
router.get('/', (req, res) => {
  const { sport, status } = req.query;
  
  let filteredTournaments = tournaments;
  
  if (sport) {
    filteredTournaments = filteredTournaments.filter(t => t.sport === sport);
  }
  
  if (status) {
    filteredTournaments = filteredTournaments.filter(t => t.status === status);
  }
  
  res.json({ tournaments: filteredTournaments });
});

// Get tournament by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const tournament = tournaments.find(t => t.id === id);
  
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }
  
  res.json({ tournament });
});

// Create new tournament
// router.post('/', async (req, res) => {
//   try {
//     const { name, sport, entry_fee, prize_pool, end_time } = req.body;
    
//     if (!name || !sport || !entry_fee || !prize_pool) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }
    
//     // In a real implementation, you would:
//     // 1. Deploy a new Market contract
//     // 2. Store the tournament in a database
//     // 3. Return the contract address
    
//     const newTournament = {
//       id: uuidv4(),
//       name,
//       sport,
//       entry_fee,
//       prize_pool,
//       status: 'active',
//       participants: 0,
//       max_participants: 100,
//       contract_address: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock address
//       created_at: new Date().toISOString()
//     };
    
//     tournaments.push(newTournament);
    
//     res.status(201).json({ 
//       tournament: newTournament,
//       message: 'Tournament created successfully'
//     });
//   } catch (error) {
//     console.error('Error creating tournament:', error);
//     res.status(500).json({ error: 'Failed to create tournament' });
//   }
// });/

// Create new tournament
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const col = db.collection('tournaments');

    const { name, sport, entry_fee, prize_pool, end_time, creator_address } = req.body;

    if (!name || !sport || !entry_fee || !prize_pool || !end_time || !creator_address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTournament = {
      tournament_id: uuidv4(),
      name,
      sport,
      entry_fee,
      prize_pool,
      status: 'active',
      participants: 0,
      max_participants: 100,
      contract_address: `0x${Math.random().toString(16).substr(2, 40)}` as string,
      creator_address,
      end_time: new Date(end_time),
      created_at: new Date(),
      updated_at: new Date(),
    };

    await col.insertOne(newTournament);

    res.status(201).json({ 
      tournament: newTournament,
      message: 'Tournament created successfully'
    });
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Join tournament
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_address, amount } = req.body;
    
    const tournament = tournaments.find(t => t.id === id);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    if (tournament.status !== 'active') {
      return res.status(400).json({ error: 'Tournament is not active' });
    }
    
    if (tournament.participants >= tournament.max_participants) {
      return res.status(400).json({ error: 'Tournament is full' });
    }
    
    // In a real implementation, you would:
    // 1. Call the smart contract to join the tournament
    // 2. Update the participant count
    // 3. Handle the transaction
    
    tournament.participants += 1;
    
    res.json({ 
      message: 'Successfully joined tournament',
      tournament: tournament,
      transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock transaction hash
    });
  } catch (error) {
    console.error('Error joining tournament:', error);
    res.status(500).json({ error: 'Failed to join tournament' });
  }
});

// Get tournament participants
router.get('/:id/participants', (req, res) => {
  const { id } = req.params;
  const tournament = tournaments.find(t => t.id === id);
  
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found' });
  }
  
  // Mock participants data
  const participants = Array.from({ length: tournament.participants }, (_, i) => ({
    address: `0x${Math.random().toString(16).substr(2, 40)}`,
    joined_at: new Date(Date.now() - Math.random() * 86400000).toISOString()
  }));
  
  res.json({ participants });
});

export { router as tournamentRoutes };
