import { Request, Response } from 'express';
import { TournamentService } from '../services/TournamentService';
import { CreateTournamentRequest, JoinTournamentRequest } from '../models/Tournament';

export class TournamentController {
  private tournamentService: TournamentService;

  constructor() {
    this.tournamentService = new TournamentService();
  }

  async getAllTournaments(req: Request, res: Response): Promise<void> {
    try {
      const { sport } = req.query;
      const tournaments = await this.tournamentService.getAllTournaments(sport as string);
      
      res.json({
        success: true,
        tournaments
      });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tournaments'
      });
    }
  }

  async getTournamentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tournament = await this.tournamentService.getTournamentById(id);
      
      if (!tournament) {
        res.status(404).json({
          success: false,
          error: 'Tournament not found'
        });
        return;
      }

      res.json({
        success: true,
        tournament
      });
    } catch (error) {
      console.error('Error fetching tournament:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tournament'
      });
    }
  }

  async createTournament(req: Request, res: Response): Promise<void> {
    try {
      const tournamentData: CreateTournamentRequest = req.body;
      
      // Validate required fields
      if (!tournamentData.name || !tournamentData.sport || !tournamentData.entry_fee || !tournamentData.prize_pool) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, sport, entry_fee, prize_pool'
        });
        return;
      }

      const tournament = await this.tournamentService.createTournament(tournamentData);
      
      res.status(201).json({
        success: true,
        tournament,
        message: 'Tournament created successfully and smart contract deployed',
        blockchain: {
          contract_address: tournament.contract_address,
          transaction_hash: 'Blockchain transaction initiated'
        }
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create tournament'
      });
    }
  }

  async joinTournament(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const joinData: JoinTournamentRequest = req.body;
      
      if (!joinData.user_address || !joinData.amount) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: user_address, amount'
        });
        return;
      }

      const result = await this.tournamentService.joinTournament(id, joinData);
      
      res.json({
        success: true,
        message: 'Successfully joined tournament',
        tournament: result.tournament,
        blockchain: {
          transaction_hash: result.transactionHash,
          contract_address: result.tournament.contract_address
        }
      });
    } catch (error) {
      console.error('Error joining tournament:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to join tournament'
      });
    }
  }

  async getTournamentParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const participants = await this.tournamentService.getTournamentParticipants(id);
      
      res.json({
        success: true,
        participants
      });
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch participants'
      });
    }
  }
}
