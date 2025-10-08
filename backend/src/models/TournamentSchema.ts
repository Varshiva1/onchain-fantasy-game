import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  Tournament,
  TournamentStatus,
  Participant
} from './Tournament';

/**
 * ✅ Use intersection instead of extends to avoid _id conflict
 */
export type TournamentDocument = Tournament & Document;
export type ParticipantDocument = Participant & Document;

/**
 * 🏆 Tournament Schema Definition
 */
const TournamentSchema = new Schema<TournamentDocument>({
  tournament_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  entry_fee: {
    type: String,
    required: true
  },
  prize_pool: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TournamentStatus),
    default: TournamentStatus.Active
  },
  participants: {
    type: Number,
    default: 0
  },
  max_participants: {
    type: Number,
    default: 100
  },
  contract_address: {
    type: String,
    required: true
  },
  creator_address: {
    type: String,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

/**
 * 👥 Participant Schema Definition
 */
const ParticipantSchema = new Schema<ParticipantDocument>({
  tournament_id: {
    type: String,
    required: true
  },
  user_address: {
    type: String,
    required: true
  },
  amount_paid: {
    type: String,
    required: true
  },
  transaction_hash: {
    type: String,
    required: true
  },
  joined_at: {
    type: Date,
    default: Date.now
  }
});

/**
 * 🧩 Model Exports (with hot-reload safety)
 */
export const TournamentModel: Model<TournamentDocument> =
  mongoose.models.Tournament ||
  mongoose.model<TournamentDocument>('Tournament', TournamentSchema);

export const ParticipantModel: Model<ParticipantDocument> =
  mongoose.models.Participant ||
  mongoose.model<ParticipantDocument>('Participant', ParticipantSchema);
