import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStory, getRecentStories, getStoryThumbnail } from "../../utils/supabase.ts";
import type { Database } from "../../../../supabase.types.ts";
import Header from "../../components/header/Header.tsx";

type Story = Database["public"]["Tables"]["stories"]["Row"];
type Thumbnail = {
    url: string;
}

export default function Home() {
    const navigate = useNavigate();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
    
    useEffect(() => {
        const fetchStories = async () => {
            try {
                const fetchedStories = await getRecentStories(6);
                setStories(fetchedStories);

                const thumbnailPromises = stories
                    .filter((story) => story.thumbnail !== null)
                    .map((story) => 
                    getStoryThumbnail(story)
                );
                
                Promise.all(thumbnailPromises).then((thumbnails) => {
                    setThumbnails(thumbnails.filter((thumbnail) => thumbnail !== null && thumbnail !== undefined));
                });
            } catch (error) {
                console.error("Error fetching stories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);
    
    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-[#F45151] text-white">
            <p>Loading stories...</p>
        </div>
        );
    }
    
    return (
        <>
        <Header />
        <div className="min-h-screen bg-white">
        <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-[#F45151] mb-8">Stories</h2>
            {stories.map((story, index) => (
                <div
                key={story.id}
                className="mb-8 p-6 border rounded-lg shadow-md cursor-pointer flex items-center"
                onClick={() => navigate(`/story/${story.slug}`)}
                >
                {thumbnails[index] && (
                    <img
                    src={thumbnails[index].url}
                    alt={`${story.title} thumbnail`}
                    className="w-24 h-24 object-cover rounded-lg mr-4"
                    />
                )}
                <div>
                    <h3 className="text-2xl font-semibold text-[#F45151] pb-1">
                    {story.title}
                    </h3>
                    <p className="text-gray-600 italic mb-4">By {story.author}</p>
                    <p className="text-sm text-gray-500 mb-2">
                    {story.body.split(" ").slice(0, 10).join(" ")}...
                    </p>
                </div>
                </div>
            ))}
            </div>
        </section>
        </div>
        </>
    );
};