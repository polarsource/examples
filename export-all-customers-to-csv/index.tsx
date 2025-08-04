import fs from "fs";
import { Polar } from "@polar-sh/sdk";
import { json2csv } from 'json-2-csv';

const polar = new Polar({
    accessToken: process.env.POLAR_API_KEY,
});

async function fetchAllCustomers() {
    let page = 1;
    let customers = new Set<string>();
    do {
        const response = await polar.customers.list({
            organizationId: process.env.POLAR_ORGANIZATION_ID,
            limit: 100,
            page,
        });
        response.result.items.forEach((item) => customers.add(item.email));
        if (page === response.result.pagination.maxPage)
            break;
        page++;
    } while (page);
    return customers;
}

async function main() {
    const customers = await fetchAllCustomers();
    const csv = await json2csv([...customers].map((email) => ({ email })), {});
    fs.writeFileSync("customers.csv", csv, "utf8");
    console.log(`Exported ${customers.size} customers to customers.csv`);
}

main()
