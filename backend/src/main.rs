use std::net::SocketAddr;
use std::sync::Arc;

use axum::{
    extract::{Query, Path, State},
    http::Method,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use uuid::Uuid;
use futures_util::stream::TryStreamExt;

mod models;
mod database;
mod blockchain;

use database::DatabaseManager;
use blockchain::BlockchainManager;
use models::*;

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseManager,
    pub blockchain: BlockchainManager,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize database
    let db_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let db_name = std::env::var("DATABASE_NAME")
        .unwrap_or_else(|_| "onchain_fantasy".to_string());
    
    let db = DatabaseManager::new(&db_url, &db_name).await?;
    db.initialize_collections().await?;
    
    // Initialize blockchain
    let rpc_url = std::env::var("RPC_URL")
        .unwrap_or_else(|_| "http://localhost:8545".to_string());
    let private_key = std::env::var("PRIVATE_KEY")
        .unwrap_or_else(|_| "0x0000000000000000000000000000000000000000000000000000000000000001".to_string());
    let factory_address = std::env::var("FACTORY_ADDRESS")
        .unwrap_or_else(|_| "0x0000000000000000000000000000000000000000".to_string());
    
    let blockchain = BlockchainManager::new(&rpc_url, &private_key, &factory_address)?;
    
    let state = Arc::new(AppState { db, blockchain });

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_origin(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/sports", get(list_sports))
        .route("/api/contests", get(list_contests))
        .route("/api/tournaments", get(list_tournaments))
        .route("/api/tournaments", post(create_tournament))
        .route("/api/tournaments/:id", get(get_tournament))
        .route("/api/tournaments/:id/join", post(join_tournament))
        .route("/api/tournaments/:id/participants", get(get_tournament_participants))
        .with_state(state)
        .layer(cors);

    let addr: SocketAddr = (
        [0, 0, 0, 0],
        std::env::var("PORT").ok().and_then(|p| p.parse().ok()).unwrap_or(8080),
    )
        .into();

    tracing::info!("listening on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
    
    Ok(())
}

async fn health() -> impl IntoResponse {
    Json(serde_json::json!({ 
        "status": "ok",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "service": "onchain-fantasy-backend"
    }))
}

async fn list_sports(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let sports_collection = state.db.sports();
    match sports_collection.find(None, None).await {
        Ok(mut cursor) => {
            let mut sports = Vec::new();
            while let Ok(Some(sport)) = cursor.try_next().await {
                sports.push(sport);
            }
            Json(serde_json::json!({ "sports": sports }))
        }
        Err(_) => {
            // Return default sports if database fails
            let default_sports = vec![
                Sport { id: None, sport_id: "cricket".to_string(), name: "Cricket".to_string(), icon: "🏏".to_string() },
                Sport { id: None, sport_id: "football".to_string(), name: "Football".to_string(), icon: "⚽".to_string() },
                Sport { id: None, sport_id: "basketball".to_string(), name: "Basketball".to_string(), icon: "🏀".to_string() },
            ];
            Json(serde_json::json!({ "sports": default_sports }))
        }
    }
}

#[derive(Deserialize)]
struct ContestQuery {
    sport: Option<String>,
}

async fn list_contests(Query(q): Query<ContestQuery>) -> impl IntoResponse {
    let default = "cricket".to_string();
    let sport = q.sport.unwrap_or(default);
    let sample = vec![
        Contest {
            id: None,
            contest_id: "1".to_string(),
            sport: sport.clone(),
            name: format!("{} Mega Contest", capitalize(&sport)),
            entry_fee: 10_000,
            prize_pool: 100_000,
            status: ContestStatus::Active,
            participants: 0,
            max_participants: 100,
            created_at: chrono::Utc::now(),
        },
        Contest {
            id: None,
            contest_id: "2".to_string(),
            sport: sport.clone(),
            name: format!("{} Head-to-Head", capitalize(&sport)),
            entry_fee: 5_000,
            prize_pool: 9_500,
            status: ContestStatus::Active,
            participants: 0,
            max_participants: 50,
            created_at: chrono::Utc::now(),
        },
    ];
    Json(serde_json::json!({ "contests": sample }))
}

async fn list_tournaments(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let tournaments_collection = state.db.tournaments();
    match tournaments_collection.find(None, None).await {
        Ok(mut cursor) => {
            let mut tournaments = Vec::new();
            while let Ok(Some(tournament)) = cursor.try_next().await {
                tournaments.push(tournament);
            }
            Json(serde_json::json!({ "tournaments": tournaments }))
        }
        Err(_) => {
            Json(serde_json::json!({ "tournaments": [] }))
        }
    }
}

async fn get_tournament(State(state): State<Arc<AppState>>, Path(id): Path<String>) -> impl IntoResponse {
    let tournaments_collection = state.db.tournaments();
    let filter = mongodb::bson::doc! { "tournament_id": &id };
    
    match tournaments_collection.find_one(filter, None).await {
        Ok(Some(tournament)) => Json(serde_json::json!({ "tournament": tournament })),
        Ok(None) => Json(serde_json::json!({ "error": "Tournament not found" })),
        Err(_) => Json(serde_json::json!({ "error": "Database error" })),
    }
}

async fn create_tournament(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateTournamentRequest>,
) -> impl IntoResponse {
    let tournament_id = Uuid::new_v4().to_string();
    let contract_address = format!("0x{}", hex::encode(&[0u8; 20]));
    
    let tournament = Tournament {
        id: None,
        tournament_id: tournament_id.clone(),
        name: payload.name,
        sport: payload.sport,
        entry_fee: payload.entry_fee,
        prize_pool: payload.prize_pool,
        status: TournamentStatus::Active,
        participants: 0,
        max_participants: 100,
        contract_address,
        creator_address: payload.creator_address,
        end_time: payload.end_time,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };
    
    let tournaments_collection = state.db.tournaments();
    match tournaments_collection.insert_one(&tournament, None).await {
        Ok(_) => Json(serde_json::json!({ 
            "success": true,
            "tournament": tournament,
            "message": "Tournament created successfully"
        })),
        Err(_) => Json(serde_json::json!({ 
            "success": false,
            "error": "Failed to create tournament"
        })),
    }
}

async fn join_tournament(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<JoinTournamentRequest>,
) -> impl IntoResponse {
    let tournaments_collection = state.db.tournaments();
    let filter = mongodb::bson::doc! { "tournament_id": &id };
    
    match tournaments_collection.find_one(filter.clone(), None).await {
        Ok(Some(mut tournament)) => {
            if tournament.participants >= tournament.max_participants {
                return Json(serde_json::json!({
                    "success": false,
                    "message": "Tournament is full"
                }));
            }
            
            // Update participant count
            tournament.participants += 1;
            tournament.updated_at = chrono::Utc::now();
            
            let update = mongodb::bson::doc! {
                "$set": {
                    "participants": tournament.participants,
                    "updated_at": tournament.updated_at
                }
            };
            
            match tournaments_collection.update_one(filter, update, None).await {
                Ok(_) => {
                    // Add participant record
                    let participant = Participant {
                        id: None,
                        tournament_id: id.clone(),
                        user_address: payload.user_address,
                        amount_paid: payload.amount,
                        transaction_hash: format!("0x{}", hex::encode(&[0u8; 32])),
                        joined_at: chrono::Utc::now(),
                    };
                    
                    let participants_collection = state.db.participants();
                    let _ = participants_collection.insert_one(&participant, None).await;
                    
                    Json(serde_json::json!({
                        "success": true,
                        "message": "Successfully joined tournament",
                        "tournament": tournament,
                        "transaction_hash": participant.transaction_hash
                    }))
                }
                Err(_) => Json(serde_json::json!({
                    "success": false,
                    "message": "Failed to update tournament"
                })),
            }
        }
        Ok(None) => Json(serde_json::json!({
            "success": false,
            "message": "Tournament not found"
        })),
        Err(_) => Json(serde_json::json!({
            "success": false,
            "message": "Database error"
        })),
    }
}

async fn get_tournament_participants(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let participants_collection = state.db.participants();
    let filter = mongodb::bson::doc! { "tournament_id": &id };
    
    match participants_collection.find(filter, None).await {
        Ok(mut cursor) => {
            let mut participants = Vec::new();
            while let Ok(Some(participant)) = cursor.try_next().await {
                participants.push(participant);
            }
            Json(serde_json::json!({ "participants": participants }))
        }
        Err(_) => Json(serde_json::json!({ "participants": [] })),
    }
}

fn capitalize(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + chars.as_str(),
    }
}



