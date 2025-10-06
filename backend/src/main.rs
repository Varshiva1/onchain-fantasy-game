use std::net::SocketAddr;

use axum::{
    extract::Query,
    http::Method,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
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
        .route("/sports", get(list_sports))
        .route("/contests", get(list_contests))
        .layer(cors);

    let addr: SocketAddr = (
        [0, 0, 0, 0],
        std::env::var("PORT").ok().and_then(|p| p.parse().ok()).unwrap_or(8080),
    )
        .into();

    tracing::info!("listening on http://{}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn health() -> impl IntoResponse {
    Json(serde_json::json!({ "status": "ok" }))
}

#[derive(Serialize, Clone)]
struct Sport {
    id: &'static str,
    name: &'static str,
}

async fn list_sports() -> impl IntoResponse {
    let sports = vec![
        Sport { id: "cricket", name: "Cricket" },
        Sport { id: "football", name: "Football" },
        Sport { id: "basketball", name: "Basketball" },
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

fn capitalize(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + chars.as_str(),
    }
}


