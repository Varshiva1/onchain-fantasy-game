use anyhow::Result;
use chrono::Utc;
use futures_util::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId};

use crate::{database::DatabaseManager, models::{Tournament, TournamentStatus, CreateTournamentRequest, JoinTournamentRequest, Participant}};

pub async fn list(db: &DatabaseManager, sport: Option<&str>) -> Result<Vec<Tournament>> {
    let coll = db.tournaments();
    let filter = match sport { Some(s) => doc!{"sport": s}, None => doc!{} };
    let mut cursor = coll.find(filter, None).await?;
    let mut out = Vec::new();
    while let Some(t) = cursor.try_next().await? { out.push(t); }
    Ok(out)
}

pub async fn get_one(db: &DatabaseManager, tournament_id: &str) -> Result<Option<Tournament>> {
    let coll = db.tournaments();
    let filter = doc!{"tournament_id": tournament_id};
    let res = coll.find_one(filter, None).await?;
    Ok(res)
}

pub async fn create(db: &DatabaseManager, payload: CreateTournamentRequest) -> Result<Tournament> {
    let coll = db.tournaments();
    let t = Tournament {
        id: None,
        tournament_id: uuid::Uuid::new_v4().to_string(),
        name: payload.name,
        sport: payload.sport,
        entry_fee: payload.entry_fee,
        prize_pool: payload.prize_pool,
        status: match payload.status.as_deref() {
            Some("Active") | None => TournamentStatus::Active,
            Some("Inactive") => TournamentStatus::Inactive,
            Some("Completed") => TournamentStatus::Completed,
            Some("Cancelled") => TournamentStatus::Cancelled,
            _ => TournamentStatus::Active,
        },
        participants: payload.participants.unwrap_or(0),
        max_participants: payload.max_participants.unwrap_or(100),
        contract_address: "0x0000000000000000000000000000000000000000".to_string(),
        creator_address: payload.creator_address,
        end_time: payload.end_time,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    coll.insert_one(&t, None).await?;
    Ok(t)
}

pub async fn join(db: &DatabaseManager, tournament_id: &str, payload: JoinTournamentRequest) -> Result<String> {
    let col_t = db.tournaments();
    let filter = doc!{"tournament_id": tournament_id};
    if let Some(mut t) = col_t.find_one(filter.clone(), None).await? {
        t.participants += 1;
        t.updated_at = Utc::now();
        // If capacity reached, set status to Inactive automatically
        let mut set_doc = doc!{
            "participants": t.participants,
            "updated_at": t.updated_at,
        };
        if t.participants >= t.max_participants { set_doc.insert("status", "Inactive"); }
        let upd = doc!{"$set": set_doc};
        col_t.update_one(filter, upd, None).await?;

        let part = Participant { id: None, tournament_id: tournament_id.to_string(), user_address: payload.user_address, amount_paid: payload.amount, transaction_hash: format!("0x{}", hex::encode(&[0u8; 32])), joined_at: Utc::now() };
        db.participants().insert_one(part, None).await?;
        return Ok("0x".to_string() + &hex::encode(&[0u8; 32]));
    }
    anyhow::bail!("not found")
}


