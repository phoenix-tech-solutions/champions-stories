import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getPublicUrl,
    getRecentStories,
    getStory,
} from "../../utils/supabase.ts";
import type { Database } from "../../../../supabase.types.ts";
import Header from "../../components/Header.tsx";
// import Footer from "@app/components/Footer.tsx";
import Footer from "../../components/Footer.tsx";

type Story = Database["public"]["Tables"]["stories"]["Row"];
type Thumbnail = {
    url: string;
};

export default function Home() {
    const navigate = useNavigate();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const storyRefs = useRef<(HTMLDivElement | null)[]>([]);
    const titleRef = useRef<HTMLHeadingElement>(null);

    // Handle initial page load animation
    useEffect(() => {
        // Short delay to ensure DOM is ready
        const timer = setTimeout(() => {
            setIsPageLoaded(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const fetchedStories = await getRecentStories(100);
                setStories(fetchedStories);

                const thumbnails = fetchedStories
                    .filter((story) => story.thumbnail !== null)
                    .map((story) => ({
                        url: getPublicUrl(`thumbnails/${story.slug}`),
                    }));

                setThumbnails(thumbnails);
            } catch (error) {
                console.error("Error fetching stories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    // Setup intersection observer for scroll animations
    useEffect(() => {
        if (!loading) {
            // Initialize refs array to match stories length
            storyRefs.current = storyRefs.current.slice(0, stories.length);

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add(
                                "opacity-100",
                                "translate-y-0",
                            );
                            entry.target.classList.remove(
                                "opacity-0",
                                "translate-y-8",
                            );
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.2 },
            );

            // Observe title
            if (titleRef.current) {
                observer.observe(titleRef.current);
            }

            // Observe all story cards
            storyRefs.current.forEach((ref) => {
                if (ref) observer.observe(ref);
            });

            return () => {
                if (titleRef.current) observer.unobserve(titleRef.current);
                storyRefs.current.forEach((ref) => {
                    if (ref) observer.unobserve(ref);
                });
            };
        }
    }, [loading, stories]);

    // Loading animation
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F45151] text-white">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4">
                    </div>
                    <p className="text-xl animate-pulse">Loading stories...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Page load overlay animation */}
            <div
                className={`fixed inset-0 bg-[#F45151] z-50 transition-opacity duration-700 ${
                    isPageLoaded
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                }`}
            >
            </div>

            <Header />
            <div
                className={`min-h-screen bg-white transition-opacity duration-700 ${
                    isPageLoaded ? "opacity-100" : "opacity-0"
                }`}
            >
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2
                            ref={titleRef}
                            className="text-4xl font-bold text-[#F45151] mb-8 opacity-0 translate-y-8 transition-all duration-700"
                        >
                            Stories
                        </h2>

                        {stories.map((story, index) => (
                            <div
                                key={story.id}
                                ref={(el) => storyRefs.current[index] = el}
                                className="mb-8 p-6 border rounded-lg shadow-md cursor-pointer flex items-center opacity-0 translate-y-8 transition-all duration-700 hover:shadow-lg transform hover:scale-[1.01]"
                                style={{ transitionDelay: `${150 * index}ms` }}
                                onClick={() => navigate(`/story/${story.slug}`)}
                            >
                                {thumbnails[index] && (
                                    <div className="overflow-hidden rounded-lg mr-4">
                                        <img
                                            src={thumbnails[index].url}
                                            alt={`${story.title} thumbnail`}
                                            className="w-30 h-30 m-3 object-cover rounded-lg transition-transform duration-500 hover:scale-110"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-2xl font-semibold text-[#F45151] pb-1">
                                        {story.title}
                                    </h3>
                                    <h3 className="text-md font-bold text-gray-600 pb-1">
                                        {story.subtitle}
                                    </h3>
                                    <p className="text-gray-600 italic mb-4">
                                        By {story.author}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        {story.body.split(" ").slice(0, 10)
                                            .join(" ")}...
                                    </p>
                                </div>
                            </div>
                        ))}

                        {stories.length === 0 && (
                            <div className="py-12 text-center opacity-0 animate-fade-in">
                                <p className="text-gray-500 italic">
                                    No stories found.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
