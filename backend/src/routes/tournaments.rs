use std::sync::Arc;
use axum::{routing::{get, post}, Router};
use crate::controllers::tournaments_controller as ctrl;
use crate::AppState;

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .route("/api/tournaments", get(ctrl::list).post(ctrl::create))
        .route("/api/tournaments/:id", get(ctrl::get_one))
        .route("/api/tournaments/:id/join", post(ctrl::join))
        .with_state(state)
}


