import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';
import { seed } from "drizzle-seed";
import dotenv from "dotenv";
import { currencies } from './currencies.js';

dotenv.config();
const db = drizzle(process.env.NETLIFY_DATABASE_URL!);

async function main() {
    await seed(db, schema).refine((f) => {
        return {
            account: {
                count: 10,
                seed: 12,
                columns: {
                    name: f.companyName(),
                    currency: f.valuesFromArray({values: [...currencies]}),
                },
                relation: {
                    transactions: {
                        columns: {
                            name: f.companyName(),
                            amount: f.number({minValue: 10, maxValue: 1000}),
                            type: f.valuesFromArray({values: ['credit', 'debit']}),
                            category: f.valuesFromArray({values: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Income', 'Investment', 'Other']}),
                            transactionAt: f.date(),
                        },
                    },
                },
            },
        };
    });
}

main().catch(console.error);
