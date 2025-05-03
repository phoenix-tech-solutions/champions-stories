import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../supabase.types.ts";

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

export function getPublicUrl(path: string) {
    const { data: { publicUrl } } = supabase
        .storage
        .from("stories")
        .getPublicUrl(path);

    return publicUrl;
}

export async function getStory(storySlug: string) {
    const query = supabase
        .from("stories")
        .select("*")
        .eq("slug", storySlug)
        .single();

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching story:", error);
        return null;
    }

    return data;
}

export async function getRecentStories(
    n: number,
) {
    const query = supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(n);

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching stories:", error);
        return [];
    }

    // if (with_images) {
    //   const allImages = await getStoryImages();

    //   if (allImages.length === 0) {
    //     return [];
    //   }

    //   const imageMap = new Map(allImages.map((image) => [image.id, image]));

    //   const mergedData = data
    //     .filter((story) => imageMap.has(story.thumbnail))
    //     .map((story) => ({
    //       ...story,
    //       image: imageMap.get(story.thumbnail)!,
    //     }));

    //   const storiesWithImages = mergedData.map((value) => {
    //     const { data: { publicUrl } } = supabase
    //       .storage
    //       .from("stories")
    //       .getPublicUrl(`thumbnails/${value.image.name}`);

    //     return { ...value, image_url: publicUrl };
    //   });

    //   return storiesWithImages;

    return data;
}

export async function getChampionOfStory(story_id: number) {
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

    return data.champion as Champion;
}

export default supabase;
