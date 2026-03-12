use axum::{
    extract::{Query, State},
    http::{HeaderMap, StatusCode},
    response::{Html, IntoResponse, Redirect},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::env;
use standardwebhooks::Webhook;

#[derive(Clone)]
struct AppState {
    client: reqwest::Client,
    access_token: String,
    webhook_secret: String,
    success_url: Option<String>,
    api_url: String,
}

#[derive(Deserialize)]
struct CheckoutParams {
    products: String,
}

#[derive(Deserialize)]
struct PortalParams {
    email: String,
}

#[derive(Deserialize, Serialize)]
struct Product {
    id: String,
    name: String,
}

#[derive(Deserialize)]
struct ProductListResponse {
    items: Vec<Product>,
}

#[derive(Deserialize)]
struct CheckoutSession {
    url: String,
}

#[derive(Serialize)]
struct CheckoutCreate {
    products: Vec<String>,
    success_url: String,
}

#[derive(Deserialize)]
struct Customer {
    id: String,
}

#[derive(Deserialize)]
struct CustomerListResponse {
    items: Vec<Customer>,
}

#[derive(Deserialize)]
struct CustomerSession {
    customer_portal_url: String,
}

#[derive(Serialize)]
struct CustomerSessionCreate {
    customer_id: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let polar_mode = env::var("POLAR_MODE").unwrap_or_else(|_| "production".to_string());
    let polar_access_token = env::var("POLAR_ACCESS_TOKEN").expect("POLAR_ACCESS_TOKEN must be set");
    let polar_webhook_secret = env::var("POLAR_WEBHOOK_SECRET").expect("POLAR_WEBHOOK_SECRET must be set");
    let success_url = env::var("POLAR_SUCCESS_URL").ok();

    let api_url = if polar_mode == "sandbox" {
        "https://sandbox-api.polar.sh/v1"
    } else {
        "https://api.polar.sh/v1"
    };

    let client = reqwest::Client::new();

    let state = AppState {
        client,
        access_token: polar_access_token,
        webhook_secret: polar_webhook_secret,
        success_url,
        api_url: api_url.to_string(),
    };

    let app = Router::new()
        .route("/", get(index))
        .route("/polar/webhooks", post(webhooks))
        .route("/checkout", get(checkout))
        .route("/portal", get(portal))
        .with_state(state);

    let addr = "0.0.0.0:3000";
    println!("Server running on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn index(State(state): State<AppState>) -> impl IntoResponse {
    let url = format!("{}/products", state.api_url);
    let response = state.client
        .get(url)
        .header("Authorization", format!("Bearer {}", state.access_token))
        .query(&[("is_archived", "false")])
        .send()
        .await;

    match response {
        Ok(res) if res.status().is_success() => {
            match res.json::<ProductListResponse>().await {
                Ok(products_res) => {
                    let mut products_html = String::new();
                    for product in products_res.items {
                        products_html.push_str(&format!(
                            "<div><a target=\"_blank\" href=\"/checkout?products={}\">{}</a></div>",
                            product.id, product.name
                        ));
                    }

                    Html(format!(
                        "<html><body>
                        <form action=\"/portal\" method=\"get\">
                          <input type=\"email\" name=\"email\" placeholder=\"Email\" required />
                          <button type=\"submit\">Open Customer Portal</button>
                        </form>
                        {}
                        </body></html>",
                        products_html
                    ))
                    .into_response()
                }
                Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("JSON Error: {}", e)).into_response(),
            }
        }
        Ok(res) => {
            let status = res.status();
            let error_text = res.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            (StatusCode::INTERNAL_SERVER_ERROR, format!("API Error: {} - {}", status, error_text)).into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

async fn webhooks(
    State(state): State<AppState>,
    headers: HeaderMap,
    body: String,
) -> impl IntoResponse {
    let webhook_id = headers.get("webhook-id").and_then(|h| h.to_str().ok());
    let webhook_timestamp = headers.get("webhook-timestamp").and_then(|h| h.to_str().ok());
    let webhook_signature = headers.get("webhook-signature").and_then(|h| h.to_str().ok());

    if let (Some(_), Some(_), Some(_)) = (webhook_id, webhook_timestamp, webhook_signature) {
        let wh = Webhook::new(&state.webhook_secret).expect("Invalid webhook secret");
        match wh.verify(body.as_bytes(), &headers) {
            Ok(_) => (StatusCode::OK, body).into_response(),
            Err(e) => (StatusCode::FORBIDDEN, e.to_string()).into_response(),
        }
    } else {
        StatusCode::BAD_REQUEST.into_response()
    }
}

async fn checkout(
    State(state): State<AppState>,
    Query(params): Query<CheckoutParams>,
) -> impl IntoResponse {
    let url = format!("{}/checkouts", state.api_url);
    let checkout_create = CheckoutCreate {
        products: vec![params.products],
        success_url: state.success_url.unwrap_or_else(|| "http://localhost:3000/".to_string()),
    };

    let response = state.client
        .post(url)
        .header("Authorization", format!("Bearer {}", state.access_token))
        .json(&checkout_create)
        .send()
        .await;

    match response {
        Ok(res) if res.status().is_success() => {
            match res.json::<CheckoutSession>().await {
                Ok(session) => Redirect::temporary(&session.url).into_response(),
                Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("JSON Error: {}", e)).into_response(),
            }
        }
        Ok(res) => {
            let error_text = res.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            (StatusCode::INTERNAL_SERVER_ERROR, format!("API Error: {} - {}", StatusCode::from_u16(0).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR), error_text)).into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

async fn portal(
    State(state): State<AppState>,
    Query(params): Query<PortalParams>,
) -> impl IntoResponse {
    let customer_list_url = format!("{}/customers", state.api_url);
    let customer_response = state.client
        .get(customer_list_url)
        .header("Authorization", format!("Bearer {}", state.access_token))
        .query(&[("email", &params.email)])
        .send()
        .await;

    match customer_response {
        Ok(res) if res.status().is_success() => {
            match res.json::<CustomerListResponse>().await {
                Ok(customers) => {
                    if let Some(customer) = customers.items.first() {
                        let portal_session_url = format!("{}/customer-sessions", state.api_url);
                        let session_create = CustomerSessionCreate {
                            customer_id: customer.id.clone(),
                        };
                        let session_response = state.client
                            .post(portal_session_url)
                            .header("Authorization", format!("Bearer {}", state.access_token))
                            .json(&session_create)
                            .send()
                            .await;

                        match session_response {
                            Ok(res) if res.status().is_success() => {
                                match res.json::<CustomerSession>().await {
                                    Ok(session) => Redirect::temporary(&session.customer_portal_url).into_response(),
                                    Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("JSON Error: {}", e)).into_response(),
                                }
                            }
                            Ok(res) => {
                                let status = res.status();
                                let error_text = res.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                                (StatusCode::INTERNAL_SERVER_ERROR, format!("API Session Error: {} - {}", status, error_text)).into_response()
                            }
                            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
                        }
                    } else {
                        (StatusCode::NOT_FOUND, "Customer not found").into_response()
                    }
                }
                Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("JSON Error: {}", e)).into_response(),
            }
        }
        Ok(res) => {
            let status = res.status();
            let error_text = res.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            (StatusCode::INTERNAL_SERVER_ERROR, format!("API Customer Error: {} - {}", status, error_text)).into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}
