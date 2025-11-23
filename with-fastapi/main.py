import os, json
from polar_sdk import Polar
from typing import Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from polar_sdk.webhooks import validate_event, WebhookVerificationError

load_dotenv()

# Environment variables
POLAR_MODE = os.getenv("POLAR_MODE", "production")
POLAR_SUCCESS_URL = os.getenv("POLAR_SUCCESS_URL")
POLAR_ACCESS_TOKEN = os.getenv("POLAR_ACCESS_TOKEN")
POLAR_WEBHOOK_SECRET = os.getenv("POLAR_WEBHOOK_SECRET")

if not POLAR_ACCESS_TOKEN:
    raise ValueError("POLAR_ACCESS_TOKEN is required")
if not POLAR_WEBHOOK_SECRET:
    raise ValueError("POLAR_WEBHOOK_SECRET is required")

# Initialize Polar SDK
polar = Polar(
    access_token=POLAR_ACCESS_TOKEN,
    server=POLAR_MODE
)

app = FastAPI(title="Polar with FastAPI", version="1.0.0")

@app.get("/", response_class=HTMLResponse)
async def home():
    """Home page displaying products and customer portal form"""
    try:
        products = polar.products.list(is_archived=False)
        
        products_html = ""
        for product in products.result.items:
            products_html += f'<div><a target="_blank" href="/checkout?products={product.id}">{product.name}</a></div>'
        
        html_content = f"""
        <html>
            <body>
                <form action="/portal" method="get">
                    <input type="email" name="email" placeholder="Email" required />
                    <button type="submit">Open Customer Portal</button>
                </form>
                <br>
                {products_html}
            </body>
        </html>
        """
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/checkout")
async def checkout(products: str, request: Request):
    """Create a checkout session and redirect to Polar checkout page"""
    if not products:
        raise HTTPException(status_code=400, detail="Missing products parameter")
    
    try:
        # Get the host from the request to construct success URL
        host = request.headers.get("host", "localhost:8000")
        success_url = POLAR_SUCCESS_URL or f"http://{host}/"
        product_id = products.split(",")[0]
        
        checkout_session = polar.checkouts.custom.create(
            request={
                "product_id": product_id,
                "success_url": success_url
            }
        )
        
        return RedirectResponse(url=checkout_session.url, status_code=302)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/portal")
async def customer_portal(email: str):
    """Create a customer portal session and redirect"""
    if not email:
        raise HTTPException(status_code=400, detail="Missing email parameter")
    
    try:
        # Find customer by email
        customer_response = polar.customers.list(email=email)
        
        if not customer_response.result.items:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        customer = customer_response.result.items[0]
        
        # Create customer portal session
        session = polar.customer_sessions.create(
            request={"customer_id": customer.id}
        )
        
        return RedirectResponse(url=session.customer_portal_url, status_code=302)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/polar/webhooks")
async def webhooks(request: Request) -> Dict[str, Any]:
    """Handle Polar webhooks with signature verification"""
    try:
        request_body = await request.body()
        event = validate_event(
            body=request_body,
            headers=request.headers,
            secret=POLAR_WEBHOOK_SECRET,
        )
        return json.loads(event.model_dump_json())
    except WebhookVerificationError as e:
        return "", 403

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
