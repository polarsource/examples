![](../logo.svg)

# Dynamic Not Editable Pricing

This FastAPI application creates dynamic pricing products with Polar integration. It generates products on-demand with custom amounts and caches them using Redis for performance.

## Prerequisites

- Python 3+ installed on your system
- Your Polar API key (Organization Access Token)
- Upstash Redis instance

## Setup

1. Clone the directory:

```bash
npx degit polarsource/examples/dynamic-not-editable-pricing ./dynamic-not-editable-pricing
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
POLAR_API_KEY=your_polar_oat_here
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

You can find your API key in your Polar's Organization settings.

## Usage

Start the FastAPI server:

```bash
fastapi dev main.py
```

The application will be available at `http://localhost:8000`.

## API Endpoints

### GET `/{amount}`

Creates a dynamic product with the specified amount and redirects to the Polar checkout page.

**Parameters:**
- `amount` (integer): The price amount in dollars (e.g., 10 for $10.00)

**Example:**
```
GET /10
```

This will:
1. Check if a Product ID with amount $10 already exists in Redis cache
2. If not cached, create a new product in Polar with the specified amount
3. Cache the Product ID in Redis for future requests
4. Create a checkout session and redirect to the Polar checkout page
