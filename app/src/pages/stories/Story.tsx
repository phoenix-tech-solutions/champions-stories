import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header.tsx";
// import { getPublicUrl, getStory } from "@app/utils/supabase.ts";
import { getPublicUrl, getStory } from "../../utils/supabase.ts";
import { Database } from "../../../../supabase.types.ts";
// import { Button } from "@app/components/ui/button.tsx";
// import Footer from "@app/components/Footer.tsx";
import { Button } from "../../components/ui/button.tsx";
import Footer from "../../components/Footer.tsx";

type Story = Database["public"]["Tables"]["stories"]["Row"];

export default function Story() {
    const { selectedStorySlug } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    // Refs for animated elements
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLHeadingElement>(null);
    const contentRef = useRef<HTMLParagraphElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    // State for maximized image
    const [maximizedImage, setMaximizedImage] = useState<{
        src: string;
        alt: string;
        caption?: string | null;
    } | null>(null);

    // Animation state for modal
    const [showMaximized, setShowMaximized] = useState(false);

    // Animate in when maximizedImage is set
    useEffect(() => {
        if (maximizedImage) {
            // Next tick to trigger CSS transition
            setTimeout(() => setShowMaximized(true), 10);
        } else {
            setShowMaximized(false);
        }
    }, [maximizedImage]);

    // Helper to close with animation
    function closeMaximized() {
        setShowMaximized(false);
        setTimeout(() => setMaximizedImage(null), 200);
    }

    useEffect(() => {
        const fetchStory = async () => {
            if (!selectedStorySlug) {
                navigate("/story");
                return;
            }

            try {
                const fetchedStory = await getStory(selectedStorySlug);
                if (!fetchedStory) {
                    navigate("/story");
                    return;
                }
                setStory(fetchedStory);
            } catch (error) {
                console.error("Error fetching story:", error);
                navigate("/story");
            } finally {
                setLoading(false);

                // Short delay to ensure DOM is ready before starting animations
                setTimeout(() => {
                    setIsPageLoaded(true);
                }, 100);
            }
        };

        fetchStory();
    }, [selectedStorySlug, navigate]);

    // Setup intersection observer for scroll animations
    useEffect(() => {
        if (!loading && story) {
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
                { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
            );

            // Observe elements
            if (titleRef.current) observer.observe(titleRef.current);
            if (subtitleRef.current) observer.observe(subtitleRef.current);
            if (contentRef.current) observer.observe(contentRef.current);
            if (buttonRef.current) observer.observe(buttonRef.current);

            return () => {
                if (titleRef.current) observer.unobserve(titleRef.current);
                if (subtitleRef.current) {
                    observer.unobserve(subtitleRef.current);
                }
                if (contentRef.current) observer.unobserve(contentRef.current);
                if (buttonRef.current) observer.unobserve(buttonRef.current);
            };
        }
    }, [loading, story]);

    // Enhanced loading state with animation
    if (loading || !story) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F45151] text-white">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4">
                    </div>
                    <p className="text-xl animate-pulse">Loading story...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Maximized Image Modal */}
            {maximizedImage && (
                <div
                    className={`fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-200 ${
                        showMaximized ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    onClick={closeMaximized}
                    style={{ cursor: "default" }}
                >
                    <div
                        className={`relative flex flex-col items-center transition-transform duration-200 ${
                            showMaximized ? "scale-100" : "scale-90"
                        }`}
                        style={{
                            maxWidth: "80vw",
                            maxHeight: "80vh",
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-2 right-2 text-white text-3xl font-bold bg-black bg-opacity-60 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-90 transition"
                            onClick={closeMaximized}
                            aria-label="Close"
                            style={{ zIndex: 10 }}
                        >
                            ×
                        </button>
                        <img
                            src={maximizedImage.src}
                            alt={maximizedImage.alt}
                            className="object-contain rounded shadow-lg"
                            style={{
                                maxWidth: "80vw",
                                maxHeight: "70vh",
                                background: "#222",
                                transition: "transform 0.2s",
                            }}
                        />
                        {maximizedImage.caption && (
                            <div className="mt-4 text-white text-center text-base bg-black bg-opacity-50 px-4 py-2 rounded">
                                {maximizedImage.caption}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add style for image hover scaling */}
            <style>
                {`
                .story-img-hover {
                    transition: transform 0.2s;
                }
                .story-img-hover:hover {
                    transform: scale(1.07);
                }
                `}
            </style>

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
                <div className="p-4">
                    <Link
                        to="/story"
                        className="inline-flex text-black items-center px-4 py-2 bg-transparent border rounded hover:border-[#d14343] hover:underline transition-all duration-100"
                    >
                        ← Back
                    </Link>
                </div>
                {/* Story Content Section */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2
                            ref={titleRef}
                            className="text-4xl font-bold text-[#F45151] mb-2 opacity-0 translate-y-8 transition-all duration-700"
                        >
                            {story.title}
                        </h2>
                        <h3
                            ref={subtitleRef}
                            className="font-bold mb-2 opacity-0 translate-y-8 transition-all duration-700 mb-4"
                        >
                            {story.subtitle}
                        </h3>

                        <h3 className="text-gray-600 italic mb-20">
                            By {story.author}
                        </h3>

                        <div
                            ref={contentRef}
                            className="text-lg text-gray-600 leading-relaxed mb-12 whitespace-pre-line opacity-0 translate-y-8 transition-all duration-700 delay-200"
                        >
                            {
                                /*
                  1) First split into box vs. non‑box segments
                  2) Map over each segment: if it matches [img-box|...|img-box], render as grid
                    otherwise, fall back to existing {{image:N}} replacement logic
                */
                            }
                            {story.body
                                .split(
                                    /(\[img-box\|[\s\S]+?\|img-box\]|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g,
                                )
                                .map((segment, index) => {
                                    // Detect a full [img-box|...|img-box] block
                                    const boxMatch = segment.match(
                                        /^\[img-box\|([\s\S]+?)\|img-box\]$/,
                                    );
                                    if (boxMatch) {
                                        // Inside a box: extract all image IDs ({{image:X}})
                                        const inner = boxMatch[1];
                                        const images = [
                                            ...inner.matchAll(
                                                /{{image:(\d+)}}(?:\[caption:([^\]]+)\])?/g,
                                            ),
                                        ].map((m) => ({
                                            id: m[1],
                                            caption: m[2] || null,
                                        }));

                                        return (
                                            <div
                                                className="max-w-[75%] mx-auto grid grid-cols-2 gap-4 auto-rows-fr my-6 text-center"
                                                key={index}
                                            >
                                                {images.map((
                                                    { id, caption },
                                                ) => (
                                                    <div
                                                        key={id}
                                                        className="h-full"
                                                    >
                                                        <img
                                                            src={getPublicUrl(
                                                                `embedded/${story.slug}/${id}`,
                                                            )}
                                                            alt={`Embedded image ${id}`}
                                                            className="w-full h-full object-cover rounded shadow story-img-hover cursor-zoom-in"
                                                            onClick={() =>
                                                                setMaximizedImage({
                                                                    src: getPublicUrl(
                                                                        `embedded/${story.slug}/${id}`,
                                                                    ),
                                                                    alt: `Embedded image ${id}`,
                                                                    caption,
                                                                })
                                                            }
                                                        />
                                                        {caption && (
                                                            <p className="text-sm text-gray-500 mt-2">
                                                                {caption}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }

                                    // Detect a full [text](link) block
                                    const linkMatch = segment.match(
                                        /^\[([^\]]+)\]\(([^\)]+)\)$/,
                                    );
                                    if (linkMatch) {
                                        const text = linkMatch[1];
                                        const link = linkMatch[2];
                                        return (
                                            <a
                                                key={index}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#F45151] underline hover:text-[#d14343] transition-colors"
                                            >
                                                {text}
                                            </a>
                                        );
                                    }
                                    // Detect italicized text
                                    const italicMatch = segment.match(
                                        /^\*([\w\s.]+?)\*$/,
                                    );
                                    if (italicMatch) {
                                        const text = italicMatch[1];
                                        return <i key={index}>{text}</i>;
                                    }

                                    // Fallback for text + single-image placeholders
                                    return segment
                                        .split(
                                            /({{image:\d+}}(?:\[caption:[^\]]+\])?)/g,
                                        )
                                        .filter(Boolean)
                                        .map((part, i) => {
                                            const [, id, caption] = part.match(
                                                /{{image:(\d+)}}(?:\[caption:([^\]]+)\])?/,
                                            ) || [];

                                            if (id) {
                                                const src = getPublicUrl(
                                                    `embedded/${story.slug}/${id}`,
                                                );
                                                return (
                                                    <div
                                                        key={`${index}-${i}`}
                                                        className="my-4 mx-auto max-w-[50%] text-center"
                                                    >
                                                        <img
                                                            src={src}
                                                            alt={`Embedded image ${id}`}
                                                            className="rounded shadow story-img-hover cursor-zoom-in"
                                                            onClick={() =>
                                                                setMaximizedImage({
                                                                    src,
                                                                    alt: `Embedded image ${id}`,
                                                                    caption,
                                                                })
                                                            }
                                                        />
                                                        {caption && (
                                                            <p className="text-sm text-gray-500 mt-2">
                                                                {caption}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <span key={`${index}-${i}`}>
                                                    {part}
                                                </span>
                                            );
                                        });
                                })}
                        </div>

                        <div
                            ref={buttonRef}
                            className="opacity-0 translate-y-8 transition-all duration-700 delay-300"
                        >
                            <Button
                                className="bg-[#F45151] hover:bg-[#d14343] w-full text-white px-8 py-4 hover:shadow-lg transform hover:scale-105 !duration-300 !transition-all"
                                onClick={() => {
                                    document.body.classList.add("opacity-0");
                                    setTimeout(() => navigate("/story"), 300);
                                    document.body.classList.remove("opacity-0");
                                }}
                            >
                                Back to All Stories
                            </Button>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
