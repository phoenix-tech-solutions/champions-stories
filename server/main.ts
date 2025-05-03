import { Hono } from 'hono'
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../supabase.types.ts";

const supabaseUrl = "https://txsrwrrbnlbjmjcrbevh.supabase.co";

// anon public key, so it is safe to expose in client-side code
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4c3J3cnJibmxiam1qY3JiZXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNDA1ODQsImV4cCI6MjA1NzcxNjU4NH0.mWoQRHJDPYkXwnDRm2IAR199ebYtD5P4sb37QOzgJG8";

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

type Story = Database["public"]["Tables"]["stories"]["Row"];
type Champion = Database["public"]["Tables"]["champions"]["Row"];
type Thumbnail = {
    url: string;
};
const app = new Hono().basePath('/api');
const PORT = 8000;

app.get('/storage/:path', (c) => {
    const path = c.req.param('path');
    if (!path) {
        return c.text("Path is required", 400);
    }

    const { data: { publicUrl } } = supabase
    .storage
    .from("stories")
    .getPublicUrl(path);

    return c.text(publicUrl)
})

app.post('/story/champion', async (c) => {
    const formData = await c.req.formData();
    const story_id = formData.get('id');

    if (!story_id || typeof story_id !== 'number') {
        return c.text("Story ID is required", 400);
    }

    const query = supabase
        .from("stories")
        .select("champion(*)")
        .eq("id", story_id)
        .single();

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching champion:", error);
        return;
    }

    return c.json(data.champion);
});

app.get('/story/:slug', async (c) => {
    const slug = c.req.param('slug');

    const query = supabase
        .from("stories")
        .select("*")
        .eq("slug", slug)
        .single();

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching story:", error);
        return c.text("Error fetching story", 500);
    }

    const story: Story = data;

    return c.json(story);
})

if (import.meta.main) {
    console.log(`Server listening on port http://localhost:${PORT}`);
    Deno.serve({ hostname: "localhost", port: PORT }, app.fetch);
}