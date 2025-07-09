use axum::{
    extract::Path,
    http::StatusCode,
    response::Json,
    routing::{get, Router},
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize)]
struct Article {
    id: String,
    title: String,
    date: String,
    content: String,
    summary: String,
    tags: Vec<String>,
    category: String,
}

#[derive(Debug, Serialize)]
struct ArticleListItem {
    id: String,
    title: String,
    date: String,
    summary: String,
    tags: Vec<String>,
    category: String,
}

#[derive(Debug, Serialize)]
struct ApiResponse<T> {
    success: bool,
    data: T,
}

#[derive(Clone)]
struct AppState {
    articles: HashMap<String, Article>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Load articles from file system
    let articles = load_articles("../zola-site/content")?;
    info!("Loaded {} articles", articles.len());

    let state = AppState { articles };

    // Build the router
    let app = Router::new()
        .route("/", get(health_check))
        .route("/api/articles", get(list_articles))
        .route("/api/articles/:id", get(get_article))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state);

    // Run the server
    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    info!("Server running on http://0.0.0.0:3000");
    
    axum::serve(listener, app).await?;
    
    Ok(())
}

async fn health_check() -> &'static str {
    "Blog API is running!"
}

async fn list_articles(
    axum::extract::State(state): axum::extract::State<AppState>,
) -> Json<ApiResponse<Vec<ArticleListItem>>> {
    let articles: Vec<ArticleListItem> = state
        .articles
        .values()
        .map(|article| ArticleListItem {
            id: article.id.clone(),
            title: article.title.clone(),
            date: article.date.clone(),
            summary: article.summary.clone(),
            tags: article.tags.clone(),
            category: article.category.clone(),
        })
        .collect();

    Json(ApiResponse {
        success: true,
        data: articles,
    })
}

async fn get_article(
    Path(id): Path<String>,
    axum::extract::State(state): axum::extract::State<AppState>,
) -> Result<Json<ApiResponse<Article>>, StatusCode> {
    match state.articles.get(&id) {
        Some(article) => Ok(Json(ApiResponse {
            success: true,
            data: article.clone(),
        })),
        None => Err(StatusCode::NOT_FOUND),
    }
}

fn load_articles(content_dir: &str) -> anyhow::Result<HashMap<String, Article>> {
    let mut articles = HashMap::new();

    for entry in WalkDir::new(content_dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.path().extension().map(|ext| ext == "md").unwrap_or(false)
                && !e.path().file_name().unwrap().to_str().unwrap().starts_with("_")
        })
    {
        let path = entry.path();
        let content = std::fs::read_to_string(path)?;
        
        // Parse frontmatter and content
        let (frontmatter, body) = parse_markdown(&content);
        
        // Generate ID from filename
        let id = path
            .file_stem()
            .unwrap()
            .to_str()
            .unwrap()
            .to_string();
        
        // Extract metadata
        let title = frontmatter
            .get("title")
            .and_then(|v| v.as_str())
            .unwrap_or(&id)
            .to_string();
            
        let date = frontmatter
            .get("date")
            .and_then(|v| v.as_str())
            .unwrap_or("2024-01-01")
            .to_string();
            
        let tags = frontmatter
            .get("tags")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str())
                    .map(|s| s.to_string())
                    .collect()
            })
            .unwrap_or_default();
            
        let category = path
            .parent()
            .and_then(|p| p.file_name())
            .and_then(|n| n.to_str())
            .unwrap_or("未分类")
            .to_string();
            
        // Generate summary
        let summary = body
            .chars()
            .take(200)
            .collect::<String>()
            + if body.len() > 200 { "..." } else { "" };
        
        let article = Article {
            id: id.clone(),
            title,
            date,
            content: body,
            summary,
            tags,
            category,
        };
        
        articles.insert(id, article);
    }

    Ok(articles)
}

fn parse_markdown(content: &str) -> (serde_json::Map<String, serde_json::Value>, String) {
    // Simple frontmatter parser
    if content.starts_with("+++") {
        let parts: Vec<&str> = content.splitn(3, "+++").collect();
        if parts.len() >= 3 {
            // Parse TOML frontmatter
            let frontmatter_str = parts[1].trim();
            let body = parts[2].trim().to_string();
            
            // Convert TOML to JSON (simplified)
            let mut map = serde_json::Map::new();
            for line in frontmatter_str.lines() {
                if let Some((key, value)) = line.split_once('=') {
                    let key = key.trim().to_string();
                    let value = value.trim().trim_matches('"').to_string();
                    map.insert(key, serde_json::Value::String(value));
                }
            }
            
            return (map, body);
        }
    }
    
    (serde_json::Map::new(), content.to_string())
}