use std::net::SocketAddr;

use axum::{
    extract::{Query, Path},
    http::Method,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_origin(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/sports", get(list_sports))
        .route("/api/contests", get(list_contests))
        .route("/api/tournaments", get(list_tournaments).post(create_tournament))
        .route("/api/tournaments/:id/join", post(join_tournament))
        .layer(cors);

    let addr: SocketAddr = (
        [0, 0, 0, 0],
        std::env::var("PORT").ok().and_then(|p| p.parse().ok()).unwrap_or(8080),
    )
        .into();

    tracing::info!("listening on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> impl IntoResponse {
    Json(serde_json::json!({ 
        "status": "ok",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "service": "onchain-fantasy-backend"
    }))
}

#[derive(Serialize, Clone)]
struct Sport {
    sport_id: String,
    name: String,
    icon: String,
}

async fn list_sports() -> impl IntoResponse {
    let sports = vec![
        Sport { sport_id: "cricket".to_string(), name: "Cricket".to_string(), icon: "🏏".to_string() },
        Sport { sport_id: "football".to_string(), name: "Football".to_string(), icon: "⚽".to_string() },
        Sport { sport_id: "basketball".to_string(), name: "Basketball".to_string(), icon: "🏀".to_string() },
        Sport { sport_id: "tennis".to_string(), name: "Tennis".to_string(), icon: "🎾".to_string() },
        Sport { sport_id: "hockey".to_string(), name: "Hockey".to_string(), icon: "🏒".to_string() },
        Sport { sport_id: "badminton".to_string(), name: "Badminton".to_string(), icon: "🏸".to_string() },
    ];
    Json(serde_json::json!({ "sports": sports }))
}

#[derive(Deserialize)]
struct ContestQuery {
    sport: Option<String>,
}

#[derive(Serialize, Clone)]
struct Contest {
    id: String,
    sport: String,
    name: String,
    entry_fee: u64,
    prize_pool: u64,
}

async fn list_contests(Query(q): Query<ContestQuery>) -> impl IntoResponse {
    let default = "cricket".to_string();
    let sport = q.sport.unwrap_or(default);
    let sample = vec![
        Contest {
            id: "1".into(),
            sport: sport.clone(),
            name: format!("{} Mega Contest", capitalize(&sport)),
            entry_fee: 10_000,
            prize_pool: 100_000,
        },
        Contest {
            id: "2".into(),
            sport: sport.clone(),
            name: format!("{} Head-to-Head", capitalize(&sport)),
            entry_fee: 5_000,
            prize_pool: 9_500,
        },
    ];
    Json(serde_json::json!({ "contests": sample }))
}

#[derive(Serialize, Clone)]
struct Tournament {
    tournament_id: String,
    name: String,
    sport: String,
    entry_fee: String,
    prize_pool: String,
    status: String,
    participants: u32,
    max_participants: u32,
    contract_address: String,
    creator_address: String,
    end_time: String,
    created_at: String,
}

async fn list_tournaments() -> impl IntoResponse {
    let tournaments = vec![
        Tournament {
            tournament_id: "1".to_string(),
            name: "Cricket World Cup 2024".to_string(),
            sport: "cricket".to_string(),
            entry_fee: "0.01".to_string(),
            prize_pool: "0.1".to_string(),
            status: "Active".to_string(),
            participants: 0,
            max_participants: 100,
            contract_address: "0x1234567890123456789012345678901234567890".to_string(),
            creator_address: "0x0000000000000000000000000000000000000000".to_string(),
            end_time: "2024-12-31T23:59:59Z".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
        Tournament {
            tournament_id: "2".to_string(),
            name: "Premier League Fantasy".to_string(),
            sport: "football".to_string(),
            entry_fee: "0.02".to_string(),
            prize_pool: "0.2".to_string(),
            status: "Active".to_string(),
            participants: 5,
            max_participants: 50,
            contract_address: "0x2345678901234567890123456789012345678901".to_string(),
            creator_address: "0x0000000000000000000000000000000000000000".to_string(),
            end_time: "2024-12-31T23:59:59Z".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
    ];
    Json(serde_json::json!({ "tournaments": tournaments }))
}

#[derive(Deserialize)]
struct CreateTournamentRequest {
    name: String,
    sport: String,
    entry_fee: String,
    prize_pool: String,
    end_time: String,
    creator_address: String,
}

#[derive(Deserialize)]
struct JoinTournamentRequest {
    user_address: String,
    amount: String,
}

async fn create_tournament(Json(payload): Json<CreateTournamentRequest>) -> impl IntoResponse {
    let tournament_id = Uuid::new_v4().to_string();
    let contract_address = format!("0x{}", hex::encode(&[0u8; 20]));
    
    let tournament = Tournament {
        tournament_id: tournament_id.clone(),
        name: payload.name,
        sport: payload.sport,
        entry_fee: payload.entry_fee,
        prize_pool: payload.prize_pool,
        status: "Active".to_string(),
        participants: 0,
        max_participants: 100,
        contract_address,
        creator_address: payload.creator_address,
        end_time: payload.end_time,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Json(serde_json::json!({ 
        "success": true,
        "tournament": tournament,
        "message": "Tournament created successfully"
    }))
}

async fn join_tournament(
    Path(id): Path<String>,
    Json(payload): Json<JoinTournamentRequest>,
) -> impl IntoResponse {
    // Mock tournament data for joining
    let tournament = Tournament {
        tournament_id: id.clone(),
        name: "Mock Tournament".to_string(),
        sport: "cricket".to_string(),
        entry_fee: payload.amount,
        prize_pool: "0.1".to_string(),
        status: "Active".to_string(),
        participants: 1,
        max_participants: 100,
        contract_address: "0x1234567890123456789012345678901234567890".to_string(),
        creator_address: "0x0000000000000000000000000000000000000000".to_string(),
        end_time: "2024-12-31T23:59:59Z".to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    Json(serde_json::json!({
        "success": true,
        "message": "Successfully joined tournament",
        "tournament": tournament,
        "transaction_hash": format!("0x{}", hex::encode(&[0u8; 32]))
    }))
}

fn capitalize(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + chars.as_str(),
    }
}
