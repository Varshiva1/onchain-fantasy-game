import mongoose, { Schema, Document, Model } from 'mongoose';
import { Tournament, TournamentStatus, Participant } from './Tournament';

export interface TournamentDocument extends Tournament, Document {}
export interface ParticipantDocument extends Participant, Document {}

const TournamentSchema = new Schema<TournamentDocument>(
  {
    tournament_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    sport: {
      type: String,
      required: true,
    },
    entry_fee: {
      type: String,
      required: true,
    },
    prize_pool: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TournamentStatus),
      default: TournamentStatus.Active,
    },
    participants: {
      type: Number,
      default: 0,
    },
    max_participants: {
      type: Number,
      default: 100,
    },
    contract_address: {
      type: String,
      required: true,
    },
    creator_address: {
      type: String,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const ParticipantSchema = new Schema<ParticipantDocument>(
  {
    tournament_id: {
      type: String,
      required: true,
      index: true,
    },
    user_address: {
      type: String,
      required: true,
    },
    amount_paid: {
      type: String,
      required: true,
    },
    transaction_hash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'joined_at',
      updatedAt: false, // no need to track updates
    },
  }
);

export const TournamentModel: Model<TournamentDocument> = mongoose.model<TournamentDocument>(
  'Tournament',
  TournamentSchema
);

export const ParticipantModel: Model<ParticipantDocument> = mongoose.model<ParticipantDocument>(
  'Participant',
  ParticipantSchema
);
