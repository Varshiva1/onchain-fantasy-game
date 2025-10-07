use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sport {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub sport_id: String,
    pub name: String,
    pub icon: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tournament {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub tournament_id: String,
    pub name: String,
    pub sport: String,
    pub entry_fee: String, // ETH amount as string
    pub prize_pool: String, // ETH amount as string
    pub status: TournamentStatus,
    pub participants: u32,
    pub max_participants: u32,
    pub contract_address: String,
    pub creator_address: String,
    pub end_time: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TournamentStatus {
    Active,
    Inactive,
    Completed,
    Cancelled,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Participant {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub tournament_id: String,
    pub user_address: String,
    pub amount_paid: String, // ETH amount as string
    pub transaction_hash: String,
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Contest {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub contest_id: String,
    pub sport: String,
    pub name: String,
    pub entry_fee: u64, // in wei
    pub prize_pool: u64, // in wei
    pub status: ContestStatus,
    pub participants: u32,
    pub max_participants: u32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ContestStatus {
    Active,
    Inactive,
    Completed,
}

// Request/Response DTOs
#[derive(Debug, Deserialize)]
pub struct CreateTournamentRequest {
    pub name: String,
    pub sport: String,
    pub entry_fee: String,
    pub prize_pool: String,
    pub end_time: DateTime<Utc>,
    pub creator_address: String,
}

#[derive(Debug, Deserialize)]
pub struct JoinTournamentRequest {
    pub user_address: String,
    pub amount: String,
}

#[derive(Debug, Serialize)]
pub struct TournamentResponse {
    pub tournament_id: String,
    pub name: String,
    pub sport: String,
    pub entry_fee: String,
    pub prize_pool: String,
    pub status: String,
    pub participants: u32,
    pub max_participants: u32,
    pub contract_address: String,
    pub creator_address: String,
    pub end_time: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct JoinTournamentResponse {
    pub success: bool,
    pub message: String,
    pub transaction_hash: Option<String>,
    pub tournament: Option<TournamentResponse>,
}
