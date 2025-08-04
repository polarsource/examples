![](../logo.svg)

# Export All Customers to CSV

This script exports all customers from your Polar organization to a CSV file.

## Prerequisites

- Node.js installed on your system
- Your Polar API key and organization ID

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Create a `.env` file in the project root with your Polar credentials:

```bash
cp .env.example .env
```

Add your Polar API credentials to the `.env` file:

```
POLAR_API_KEY=your_polar_api_key_here
POLAR_ORGANIZATION_ID=your_organization_id_here
```

You can find your API key and organization ID in your Polar dashboard settings.

## Usage

Run the script to export all customers:

```bash
npm run fetch-all-customers
```

The script will:
1. Fetch all customers from your Polar organization (paginated, 100 customers per page)
2. Extract their email addresses
3. Export the data to a `customers.csv` file in the project root
4. Display the total number of customers exported

## Output

The script generates a `customers.csv` file with the following structure:

```csv
email
customer1@example.com
customer2@example.com
...
```
