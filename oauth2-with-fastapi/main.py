import os
import httpx
import secrets
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv
from urllib.parse import urlencode
from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse

load_dotenv()

app = FastAPI(title="Polar OAuth 2.0 in FastAPI", version="1.0.0")

templates = Jinja2Templates(directory="templates")

POLAR_CLIENT_ID = os.getenv("POLAR_CLIENT_ID")
POLAR_CLIENT_SECRET = os.getenv("POLAR_CLIENT_SECRET")
POLAR_REDIRECT_URI = os.getenv("POLAR_REDIRECT_URI")
POLAR_AUTH_URL = os.getenv("POLAR_AUTH_URL")
POLAR_TOKEN_URL = os.getenv("POLAR_TOKEN_URL")
POLAR_USERINFO_URL = os.getenv("POLAR_USERINFO_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key")

# Note: In-memory storage for demo purposes (use proper database in production)
oauth_states = {}
user_tokens = {}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str
    scope: str
    id_token: str


class UserInfo(BaseModel):
    sub: str
    email: Optional[str] = None
    name: Optional[str] = None


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page with login button"""
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/login")
async def login():
    """Redirect user to Polar.sh OAuth2 authorization"""
    if not all([POLAR_CLIENT_ID, POLAR_REDIRECT_URI, POLAR_AUTH_URL]):
        raise HTTPException(status_code=500, detail="OAuth2 configuration incomplete")

    # Generate state parameter for security
    state = secrets.token_urlsafe(32)
    oauth_states[state] = True

    # Build authorization URL
    params = {
        "response_type": "code",
        "client_id": POLAR_CLIENT_ID,
        "redirect_uri": POLAR_REDIRECT_URI,
        "scope": "openid email",
        "state": state,
    }

    auth_url = f"{POLAR_AUTH_URL}?{urlencode(params)}"
    return RedirectResponse(url=auth_url)


@app.get("/callback")
async def callback(code: str, state: str, request: Request):
    """Handle OAuth2 callback from Polar.sh"""
    # Verify state parameter
    if state not in oauth_states:
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    # Remove used state
    del oauth_states[state]

    try:
        # Exchange authorization code for access token
        token_data = await exchange_code_for_token(code)

        # Get user information
        user_info = await get_user_info(token_data.access_token)

        # Store tokens (in production, use secure storage)
        user_tokens[user_info.sub] = {
            "access_token": token_data.access_token,
            "refresh_token": token_data.refresh_token,
            "user_info": user_info.dict(),
        }

        return templates.TemplateResponse(
            "callback.html",
            {
                "request": request,
                "user_info": user_info,
                "code": code,
                "access_token": token_data.access_token,
                "raw_response": user_info,
            },
        )

    except Exception as e:
        return templates.TemplateResponse(
            "callback.html", {"request": request, "error": str(e)}
        )


async def exchange_code_for_token(code: str) -> TokenResponse:
    """Exchange authorization code for access token"""
    if not all([POLAR_CLIENT_ID, POLAR_CLIENT_SECRET, POLAR_TOKEN_URL]):
        raise HTTPException(
            status_code=500, detail="Token exchange configuration incomplete"
        )

    async with httpx.AsyncClient() as client:
        response = await client.post(
            POLAR_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": POLAR_CLIENT_ID,
                "client_secret": POLAR_CLIENT_SECRET,
                "redirect_uri": POLAR_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=400, detail=f"Token exchange failed: {response.text}"
            )

        return TokenResponse(**response.json())


async def get_user_info(access_token: str) -> UserInfo:
    """Get user information using access token"""
    if not POLAR_USERINFO_URL:
        raise HTTPException(status_code=500, detail="Userinfo URL not configured")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            POLAR_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"}
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=400, detail=f"Failed to get user info: {response.text}"
            )

        return UserInfo(**response.json())


@app.get("/api/user/{user_id}")
async def get_user_api(user_id: str):
    """API endpoint to get user data"""
    if user_id not in user_tokens:
        raise HTTPException(status_code=401, detail="User not authenticated")
    return user_tokens[user_id]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
