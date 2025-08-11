![](../logo.svg)

# Polar OAuth 2.0 in FastAPI

A FastAPI application demonstrating OAuth 2.0 integration with Polar for secure user authentication and API access. This application implements the complete OAuth 2.0 authorization code flow with OpenID Connect support.

## Prerequisites

- Python 3+ installed on your system

## Setup

1. Clone the directory:

```bash
npx degit polarsource/examples/oauth2-with-fastapi ./oauth2-with-fastapi
```

2. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Configure environment variables:

Create a `.env` file in the project root with your credentials:

```bash
cp .env.example .env
```

Add your credentials to the `.env` file:

```
POLAR_CLIENT_ID="polar_ci_..."
POLAR_CLIENT_SECRET="polar_cs_..."
POLAR_REDIRECT_URI="http://localhost:8000/callback"
POLAR_AUTH_URL="https://polar.sh/oauth2/authorize"
POLAR_TOKEN_URL="https://api.polar.sh/v1/oauth2/token"
POLAR_USERINFO_URL="https://api.polar.sh/v1/oauth2/userinfo"
SECRET_KEY="your_random_key"
BASE_URL="http://localhost:8000"
```

## Usage

Start the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The application will be available at `http://localhost:8000`.

## API Endpoints

### GET `/`
Home page with login button and OAuth 2.0 flow explanation.

### GET `/login`
Initiates the OAuth 2.0 authorization flow by redirecting users to Polar for authentication.

**Flow:**
1. Generates a secure state parameter for CSRF protection
2. Redirects user to Polar OAuth 2.0 authorization endpoint
3. Requests `openid email` scopes for user authentication

### GET `/callback`
Handles the OAuth 2.0 callback from Polar after user authorization.

**Parameters:**
- `code` (string): Authorization code from Polar
- `state` (string): State parameter for security validation

**Process:**
1. Validates the state parameter for security
2. Exchanges authorization code for access token
3. Retrieves user information using the access token
4. Stores tokens securely (**in-memory for demo, use database in production**)
5. Displays authentication results and user information

### GET `/api/user/{user_id}`
Protected API endpoint that returns user data and tokens.

**Parameters:**
- `user_id` (string): The user's unique identifier (sub from OAuth 2.0)

**Response:**
Returns user tokens and information if the user is authenticated.

**Security:**
- Requires valid OAuth 2.0 authentication
- Returns 401 if user is not authenticated
