import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

type CsvStoryRow = {
    id: string;
    title: string;
    body: string;
    created_at: string;
    slug: string;
    author: string;
    subtitle: string;
    champion: string;
    thumbnail: string;
};

function toOptionalString(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function toTimestampMs(value: string): number {
    const ms = Date.parse(value);
    if (!Number.isFinite(ms)) {
        throw new Error(`Invalid created_at: ${JSON.stringify(value)}`);
    }
    return ms;
}

async function main() {
    const csvPath = process.argv[2] ?? "/Users/sreysus/Downloads/stories_rows.csv";
    const convexUrl = process.env["CONVEX_URL"] ??
        process.env["VITE_CONVEX_URL"] ??
        "http://127.0.0.1:3210";

    const csv = await readFile(csvPath, "utf8");
    const records = parse(csv, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        trim: false,
    }) as CsvStoryRow[];

    const client = new ConvexHttpClient(convexUrl);

    let stories = 0;
    for (const row of records) {
        await client.mutation(api.seed.upsertStory, {
            legacyId: Number(row.id),
            title: row.title,
            subtitle: toOptionalString(row.subtitle),
            body: row.body,
            slug: row.slug,
            author: row.author,
            createdAt: toTimestampMs(row.created_at),
            championLegacyId: toOptionalNumber(row.champion),
        });
        stories++;
        if (stories % 10 === 0) {
            // eslint-disable-next-line no-console
            console.log(`Seeded ${stories}/${records.length} stories...`);
        }
    }

    // eslint-disable-next-line no-console
    console.log(`Done. Seeded ${stories} stories.`);
}

await main();

