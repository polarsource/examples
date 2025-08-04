import polar_sdk
from os import getenv
from fastapi import FastAPI
from polar_sdk import Polar
from dotenv import load_dotenv
from upstash_redis import Redis
from fastapi.responses import RedirectResponse

load_dotenv()

app = FastAPI()


@app.get("/{amount}")
def read_item(amount: int):
    polar = Polar(access_token=getenv("POLAR_API_KEY"))  # Organization Access Token
    redis = Redis.from_env()
    product_id = redis.get(f"dynamic_price_{amount}_product_id")
    if not product_id:
        res = polar.products.create(
            request={
                "recurring_interval": None,
                "name": "Dynamic Product Name",
                "description": "Dynamic Product Description",
                "prices": [
                    polar_sdk.ProductPriceFixedCreate(
                        amount_type="fixed", price_amount=amount * 100
                    )
                ],
            }
        )
        product_id = res.id
        redis.set(f"dynamic_price_{amount}_product_id", product_id)
    checkoutSession = polar.checkouts.create(request={"products": [product_id]})
    return RedirectResponse(url=checkoutSession.url)
