use std::sync::Arc;
use axum::{extract::{Query, Path, State}, Json};
use serde::Deserialize;
use chrono::{DateTime, Utc};

use crate::{models::{CreateTournamentRequest, JoinTournamentRequest}, AppState};
use crate::services::tournaments_service as svc;

#[derive(Deserialize)]
pub struct ListQuery { pub sport: Option<String> }

pub async fn list(State(state): State<Arc<AppState>>, Query(q): Query<ListQuery>) -> Json<serde_json::Value> {
    let res = svc::list(&state.db, q.sport.as_deref()).await;
    Json(serde_json::json!({ "tournaments": res.unwrap_or_default() }))
}

pub async fn get_one(State(state): State<Arc<AppState>>, Path(id): Path<String>) -> Json<serde_json::Value> {
    let res = svc::get_one(&state.db, &id).await;
    match res {
        Ok(Some(t)) => Json(serde_json::json!({"tournament": t})),
        Ok(None) => Json(serde_json::json!({"error": "not found"})),
        Err(_) => Json(serde_json::json!({"error": "db error"})),
    }
}

pub async fn create(State(state): State<Arc<AppState>>, Json(payload): Json<CreateTournamentRequest>) -> Json<serde_json::Value> {
    let res = svc::create(&state.db, payload).await;
    match res {
        Ok(t) => Json(serde_json::json!({"success": true, "tournament": t})),
        Err(e) => Json(serde_json::json!({"success": false, "error": e.to_string()})),
    }
}

pub async fn join(State(state): State<Arc<AppState>>, Path(id): Path<String>, Json(payload): Json<JoinTournamentRequest>) -> Json<serde_json::Value> {
    let res = svc::join(&state.db, &id, payload).await;
    match res {
        Ok(tx) => Json(serde_json::json!({"success": true, "transaction_hash": tx})),
        Err(e) => Json(serde_json::json!({"success": false, "error": e.to_string()})),
    }
}


