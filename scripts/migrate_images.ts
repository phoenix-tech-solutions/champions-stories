import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const supabaseProjectRef = "txsrwrrbnlbjmjcrbevh";
const supabaseBucket = "stories";
const supabasePublicBase =
    `https://${supabaseProjectRef}.supabase.co/storage/v1/object/public/${supabaseBucket}/`;

function uniqueSortedNumbers(values: number[]): number[] {
    return [...new Set(values)].sort((a, b) => a - b);
}

async function uploadToConvexStorage(
    client: ConvexHttpClient,
    bytes: ArrayBuffer,
    contentType: string | null,
) {
    const uploadUrl = await client.mutation(api.images.getUploadUrl, {});
    const res = await fetch(uploadUrl, {
        method: "POST",
        headers: contentType ? { "content-type": contentType } : undefined,
        body: bytes,
    });
    if (!res.ok) {
        throw new Error(`Convex upload failed: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as { storageId: string };
    return json.storageId;
}

async function tryFetch(url: string): Promise<Response | null> {
    const res = await fetch(url);
    if (res.ok) return res;
    return null;
}

async function migrate() {
    const convexUrl = process.env["CONVEX_URL"] ??
        process.env["VITE_CONVEX_URL"] ??
        "http://127.0.0.1:3210";
    const client = new ConvexHttpClient(convexUrl);

    const stories = await client.query(api.stories.listRecent, {
        limit: 1000,
        withSubtitleOnly: false,
    });

    let thumbnailsUploaded = 0;
    let embeddedUploaded = 0;

    for (const story of stories) {
        // 1) Thumbnail
        if (!story.thumbnailFileId) {
            const thumbUrl = `${supabasePublicBase}thumbnails/${story.slug}`;
            const thumbRes = await tryFetch(thumbUrl);
            if (thumbRes) {
                const buf = await thumbRes.arrayBuffer();
                const storageId = await uploadToConvexStorage(
                    client,
                    buf,
                    thumbRes.headers.get("content-type"),
                );
                await client.mutation(api.images.attachThumbnail, {
                    storySlug: story.slug,
                    fileId: storageId,
                });
                thumbnailsUploaded++;
            }
        }

        // 2) Embedded images referenced by {{image:N}}
        const indexes = uniqueSortedNumbers(
            [...story.body.matchAll(/{{image:(\d+)}}/g)].map((m) => Number(m[1])),
        );
        for (const idx of indexes) {
            const hasAlready =
                Array.isArray(story.embeddedFileIds) &&
                story.embeddedFileIds.length >= idx &&
                story.embeddedFileIds[idx - 1] !== null &&
                story.embeddedFileIds[idx - 1] !== undefined;
            if (hasAlready) continue;

            const embedUrl = `${supabasePublicBase}embedded/${story.slug}/${idx}`;
            const embedRes = await tryFetch(embedUrl);
            if (!embedRes) continue;

            const buf = await embedRes.arrayBuffer();
            const storageId = await uploadToConvexStorage(
                client,
                buf,
                embedRes.headers.get("content-type"),
            );
            await client.mutation(api.images.attachEmbeddedImage, {
                storySlug: story.slug,
                index: idx,
                fileId: storageId,
            });
            embeddedUploaded++;
        }
    }

    // eslint-disable-next-line no-console
    console.log(
        `Done. Uploaded ${thumbnailsUploaded} thumbnails and ${embeddedUploaded} embedded images.`,
    );
}

await migrate();

