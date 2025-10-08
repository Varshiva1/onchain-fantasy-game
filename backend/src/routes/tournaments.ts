import { Router } from 'express';
import { TournamentController } from '../controllers/TournamentController';

const router = Router();
const tournamentController = new TournamentController();

// Get all tournaments
router.get('/', (req, res) => {
  tournamentController.getAllTournaments(req, res);
});

// Get tournament by ID
router.get('/:id', (req, res) => {
  tournamentController.getTournamentById(req, res);
});

// Create new tournament
router.post('/', (req, res) => {
  tournamentController.createTournament(req, res);
});

// Join tournament
router.post('/:id/join', (req, res) => {
  tournamentController.joinTournament(req, res);
});

// Get tournament participants
router.get('/:id/participants', (req, res) => {
  tournamentController.getTournamentParticipants(req, res);
});

export { router as tournamentRoutes };
