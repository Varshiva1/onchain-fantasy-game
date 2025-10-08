import mongoose from 'mongoose';
import { TournamentModel } from '../models/TournamentSchema';
import connectDB from '../config/database';

const sampleTournaments = [
  {
    tournament_id: 'tournament-1',
    name: 'Cricket World Cup 2024',
    sport: 'cricket',
    entry_fee: '0.01',
    prize_pool: '0.1',
    status: 'Active',
    participants: 0,
    max_participants: 100,
    contract_address: '0x1234567890123456789012345678901234567890',
    creator_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    tournament_id: 'tournament-2',
    name: 'Premier League Fantasy',
    sport: 'football',
    entry_fee: '0.02',
    prize_pool: '0.2',
    status: 'Active',
    participants: 0,
    max_participants: 50,
    contract_address: '0x2345678901234567890123456789012345678901',
    creator_address: '0xbcdef1234567890abcdef1234567890abcdef123',
    end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    tournament_id: 'tournament-3',
    name: 'Tennis Grand Slam',
    sport: 'tennis',
    entry_fee: '0.005',
    prize_pool: '0.05',
    status: 'Active',
    participants: 0,
    max_participants: 200,
    contract_address: '0x3456789012345678901234567890123456789012',
    creator_address: '0xcdef1234567890abcdef1234567890abcdef1234',
    end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    tournament_id: 'tournament-4',
    name: 'Basketball Championship',
    sport: 'basketball',
    entry_fee: '0.015',
    prize_pool: '0.15',
    status: 'Active',
    participants: 0,
    max_participants: 80,
    contract_address: '0x4567890123456789012345678901234567890123',
    creator_address: '0xdef1234567890abcdef1234567890abcdef12345',
    end_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function seedTournaments() {
  try {
    await connectDB();
    
    // Clear existing tournaments
    await TournamentModel.deleteMany({});
    console.log('Cleared existing tournaments');
    
    // Insert sample tournaments
    await TournamentModel.insertMany(sampleTournaments);
    console.log('Sample tournaments seeded successfully!');
    
    // Display the seeded tournaments
    const tournaments = await TournamentModel.find({});
    console.log(`Total tournaments in database: ${tournaments.length}`);
    tournaments.forEach(t => {
      console.log(`- ${t.name} (${t.sport}) - Entry: ${t.entry_fee} ETH, Prize: ${t.prize_pool} ETH`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tournaments:', error);
    process.exit(1);
  }
}

seedTournaments();
