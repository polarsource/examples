![](../logo.svg)

# Getting started with Polar and FastAPI

## Prerequisites

- Python 3.8+ installed on your system
- A Polar account with API access

## Clone the repository

```bash
npx degit polarsource/examples/with-fastapi ./with-fastapi
```

## Setup

1. Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables:

```bash
cp .env.example .env
```

## Usage

Start the FastAPI development server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or run directly with Python:

```bash
python main.py
```

The application will be available at `http://localhost:8000`.
