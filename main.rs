use axum::{
    routing::{get, post},
    http::StatusCode,
    Json, Router,
};
use serde::{Deserialize, Serialize};
#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let app = Router::new()
      .route("/document", get(), post());
    let listener = tokio::net::TcpListener::bind("0.0.0.0:24879").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
