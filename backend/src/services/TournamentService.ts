import { TournamentModel, ParticipantModel } from '../models/TournamentSchema';
import { Tournament, CreateTournamentRequest, JoinTournamentRequest, TournamentStatus } from '../models/Tournament';
import { BlockchainService } from './BlockchainService';
import { v4 as uuidv4 } from 'uuid';

export class TournamentService {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  async getAllTournaments(sport?: string): Promise<Tournament[]> {
    const filter = sport ? { sport } : {};
    const tournaments = await TournamentModel.find(filter).sort({ created_at: -1 });
    return tournaments;
  }

  async getTournamentById(tournamentId: string): Promise<Tournament | null> {
    const tournament = await TournamentModel.findOne({ tournament_id: tournamentId });
    return tournament;
  }

  async createTournament(data: CreateTournamentRequest): Promise<Tournament> {
    try {
      // Deploy smart contract for the tournament
      const blockchainResult = await this.blockchainService.deployTournamentContract({
        name: data.name,
        sport: data.sport,
        entryFee: data.entry_fee,
        prizePool: data.prize_pool,
        maxParticipants: data.max_participants || 100,
        creatorAddress: data.creator_address
      });

      const tournament = new TournamentModel({
        tournament_id: uuidv4(),
        name: data.name,
        sport: data.sport,
        entry_fee: data.entry_fee,
        prize_pool: data.prize_pool,
        status: data.status ? data.status as TournamentStatus : TournamentStatus.Active,
        participants: data.participants || 0,
        max_participants: data.max_participants || 100,
        contract_address: blockchainResult.contractAddress,
        creator_address: data.creator_address,
        end_time: new Date(data.end_time),
        created_at: new Date(),
        updated_at: new Date()
      });

      const savedTournament = await tournament.save();
      
      console.log(`Tournament created with contract address: ${blockchainResult.contractAddress}`);
      console.log(`Blockchain transaction hash: ${blockchainResult.transactionHash}`);
      
      return savedTournament;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament and deploy smart contract');
    }
  }

  async joinTournament(tournamentId: string, data: JoinTournamentRequest): Promise<{ tournament: Tournament; transactionHash: string }> {
    const tournament = await TournamentModel.findOne({ tournament_id: tournamentId });
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.Active) {
      throw new Error('Tournament is not active');
    }

    if (tournament.participants >= tournament.max_participants) {
      throw new Error('Tournament is full');
    }

    try {
      // Join tournament on blockchain
      const transactionHash = await this.blockchainService.joinTournament(
        tournament.contract_address,
        data.user_address,
        data.amount
      );

      // Update tournament participants
      tournament.participants += 1;
      
      // If capacity reached, set status to Inactive
      if (tournament.participants >= tournament.max_participants) {
        tournament.status = TournamentStatus.Inactive;
      }
      
      tournament.updated_at = new Date();
      await tournament.save();

      // Create participant record
      const participant = new ParticipantModel({
        tournament_id: tournamentId,
        user_address: data.user_address,
        amount_paid: data.amount,
        transaction_hash: transactionHash,
        joined_at: new Date()
      });

      await participant.save();

      console.log(`User ${data.user_address} joined tournament ${tournamentId}`);
      console.log(`Blockchain transaction hash: ${transactionHash}`);

      return {
        tournament,
        transactionHash
      };
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw new Error('Failed to join tournament on blockchain');
    }
  }

  async getTournamentParticipants(tournamentId: string): Promise<any[]> {
    const participants = await ParticipantModel.find({ tournament_id: tournamentId });
    return participants;
  }

  async updateTournamentStatus(tournamentId: string, status: TournamentStatus): Promise<Tournament | null> {
    const tournament = await TournamentModel.findOneAndUpdate(
      { tournament_id: tournamentId },
      { status, updated_at: new Date() },
      { new: true }
    );
    return tournament;
  }
}
