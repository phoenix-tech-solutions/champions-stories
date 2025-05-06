import { useEffect, useRef, useState } from "react";
import Arrow from "/arrow_down.svg";
import { Button } from "@app/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import supabase, {
    getChampionOfStory,
    getPublicUrl,
    getRecentStories,
    getStory,
} from "../utils/supabase.ts";
import type { Database } from "../../../supabase.types.ts";
import AboutSection from "@app/components/AboutSection.tsx";
import Footer from "@app/components/Footer.tsx";

type Champion = Database["public"]["Tables"]["champions"]["Row"];
type Story = Database["public"]["Tables"]["stories"]["Row"];
type Thumbnail = {
    url: string;
};

const titleVariations = [
    "Legends",
    "Champions",
    "Heroes",
    "Inspiration",
    "Courage",
    "Strength",
    "Resilience",
];

const titleStyles: React.CSSProperties[] = [
    { fontStyle: "italic" },
    { textDecoration: "underline" },
    { fontWeight: "bold" },
    { textTransform: "uppercase" as React.CSSProperties["textTransform"] },
    { letterSpacing: "-0.05em" },
];

export default function Home() {
    const storiesSectionRef = useRef<HTMLElement>(null);
    const aboutSectionRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const viewAllButtonRef = useRef<HTMLDivElement>(null);
    const [imageOpacity, setImageOpacity] = useState(0.7);
    const [isStoriesVisible, setIsStoriesVisible] = useState(false);
    const [isAboutVisible, setIsAboutVisible] = useState(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (story: Story) => {
        // Add a small fade-out effect before navigation
        document.body.classList.add(
            "opacity-0",
            "transition-opacity",
            "duration-300",
        );
        setTimeout(() => {
            navigate(`/story/${story.slug}`);
        }, 300);
    };

    const handleViewAllClick = () => {
        // Add a small fade-out effect before navigation
        document.body.classList.add(
            "opacity-0",
            "transition-opacity",
            "duration-300",
        );
        setTimeout(() => {
            navigate("/story");
        }, 300);
    };

    useEffect(() => {
        setIsPageLoaded(true);

        // Reset any previous navigation fade-out effect
        document.body.classList.remove("opacity-0");
        document.body.classList.add("opacity-100");
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = globalThis.scrollY;
            const viewportHeight = globalThis.innerHeight;

            if (scrollY <= viewportHeight) {
                const startingOpacity = 0.7;
                const opacity = startingOpacity -
                    Math.min(scrollY / viewportHeight, startingOpacity);
                setImageOpacity(opacity);
            }

            if (aboutSectionRef.current) {
                const rect = aboutSectionRef.current.getBoundingClientRect();
                setIsAboutVisible(rect.top <= globalThis.innerHeight * 0.75);
            }

            if (storiesSectionRef.current) {
                const rect = storiesSectionRef.current.getBoundingClientRect();
                setIsStoriesVisible(rect.top <= globalThis.innerHeight * 0.75);
            }

            cardRefs.current.forEach(cardRef => {
                if (cardRef) {
                    const rect = cardRef.getBoundingClientRect();
                    const isVisible = rect.top <= globalThis.innerHeight * 0.85;
                    if (isVisible) {
                        cardRef.classList.add("opacity-100", "translate-y-0");
                        cardRef.classList.remove("opacity-0", "translate-y-8");
                    }
                }
            });

            // Check "View All" button visibility
            if (viewAllButtonRef.current) {
                const rect = viewAllButtonRef.current.getBoundingClientRect();
                const isVisible = rect.top <= globalThis.innerHeight * 0.9;
                if (isVisible) {
                    viewAllButtonRef.current.classList.add(
                        "opacity-100",
                        "translate-y-0",
                    );
                    viewAllButtonRef.current.classList.remove(
                        "opacity-0",
                        "translate-y-8",
                    );
                }
            }
        };

        handleScroll();
        globalThis.addEventListener("scroll", handleScroll);
        return () => globalThis.removeEventListener("scroll", handleScroll);
    }, []);

    const [currentTitleStyle, setCurrentTitleStyle] = useState(titleStyles[0]);
    const [currentTitle, setCurrentTile] = useState(titleVariations[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTile((prevTitle) => {
                const currentIndex = titleVariations.findIndex((title) =>
                    title === prevTitle
                );
                const nextIndex = (currentIndex + 1) % titleVariations.length;
                return titleVariations[nextIndex];
            });

            setCurrentTitleStyle((prevStyle) => {
                const currentIndex = titleStyles.findIndex((style) =>
                    style === prevStyle
                );
                const nextIndex = (currentIndex + 1) % titleStyles.length;
                return titleStyles[nextIndex];
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const [stories, setStories] = useState<Story[]>([]);
    const [_champions, setChampions] = useState<Champion[]>([]);
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
    const [showThumbnails, setShowThumbnails] = useState(false);

    useEffect(() => {
        getRecentStories(6).then((stories) => {
            if (stories) {
                setStories(stories);

                const thumbnails = stories
                    .filter((story) => story.thumbnail !== null)
                    .map((story) => ({ url: getPublicUrl(`thumbnails/${story.slug}`) }));
                
                setThumbnails(thumbnails);
                
                const champions = stories.map((story) =>
                    getChampionOfStory(story.id)
                );
                Promise.all(champions).then((champions) => {
                    setChampions(
                        champions.filter((champion) =>
                            champion !== null && champion !== undefined
                        ),
                    );
                });
            } else {
                console.error("Failed to fetch champions");
            }
        }).catch((error) => {
            console.error("Error fetching champions:", error);
        });
        setShowThumbnails(true);
    }, []);

    useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, stories.length);
    }, [stories]);

    return (
        <div className="scroll-smooth">
            {/* Page load overlay */}
            <div
                className={`fixed inset-0 bg-[#F45151] z-50 transition-opacity duration-1000 ${
                    isPageLoaded
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                }`}
            >
            </div>

            {/* Hero Section */}
            <section
                className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${
                    isPageLoaded ? "opacity-100" : "opacity-0"
                }`}
            >
                <div className="absolute inset-0 bg-[#F45151]">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-[url(/home.jpg)] transition-opacity duration-500"
                        style={{ opacity: imageOpacity * 0.5 }}
                    />
                </div>

                <div className="relative z-10 text-center px-4 transition-all duration-1000 transform">
                    <h1
                        className={`text-6xl md:text-8xl font-bold text-white mb-8 transition-transform duration-1000 ${
                            isPageLoaded
                                ? "translate-y-0 opacity-100"
                                : "translate-y-16 opacity-0"
                        }`}
                    >
                        Stories of{" "}
                        <span style={{ ...currentTitleStyle }}>
                            {currentTitle}
                        </span>
                    </h1>
                </div>
                <div
                    className={`absolute bottom-8 flex justify-center w-full transition-all duration-1000 delay-500 ${
                        isPageLoaded
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-10"
                    }`}
                >
                    <img
                        src={Arrow}
                        className="w-12 h-12 animate-bounce"
                        alt="Scroll down"
                    />
                </div>
            </section>

            {/* About Section */}
            <div ref={aboutSectionRef} className="w-full">
                <div
                    className={`transition-all duration-1000 transform ${
                        isAboutVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-16"
                    }`}
                >
                    <AboutSection />
                </div>
            </div>

            {/* CTA Section */}
            <section className="bg-[#F45151] text-white py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-8">
                        Join the Community
                    </h2>

                    {/* Video Embed */}
                    <div className="mx-auto mb-8 max-w-3xl">
                        <div
                            className="relative"
                            style={{ paddingTop: "56.25%" /* 16:9 */ }}
                        >
                            <iframe
                                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                                src="https://www.youtube.com/embed/beWuHwDkN1U"
                                title="Champions Community Foundation"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    <div className="flex flex-row gap-4 align-items-center justify-center">
                        <Button asChild>
                            <a
                                href="https://www.championscommunityfoundation.org/champions-place"
                                className="text-black hover:bg-gray-200 text-lg px-12 py-6 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                Champions Place
                            </a>
                        </Button>
                        <Button asChild>
                            <a
                                href="/element-six"
                                className="text-black hover:bg-gray-200 text-lg px-12 py-6 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                Element Six
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stories Section */}
            <section ref={storiesSectionRef} className="bg-white px-4 pt-16">
                <div className="max-w-6xl mx-auto">
                    <h2
                        className={`text-4xl font-bold text-[#F45151] mb-16 text-center transition-all duration-1000 transform ${
                            isStoriesVisible
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-16"
                        }`}
                    >
                        Recent Stories
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {stories.length > 0
                            ? (
                                stories.map((story, index) => (
                                    <div
                                        key={index}
                                        ref={(el) =>
                                            cardRefs.current[index] = el}
                                        className="opacity-0 translate-y-8 transition-all duration-700 delay-100"
                                        style={{
                                            transitionDelay: `${
                                                150 * (index % 3)
                                            }ms`,
                                        }}
                                    >
                                        <Card
                                            story={story}
                                            thumbnail={thumbnails[index]?.url ||
                                                ""}
                                            handleCardClick={handleCardClick}
                                        />
                                    </div>
                                ))
                            )
                            : (
                                <p
                                    className={`transition-all duration-1000 ${
                                        isStoriesVisible
                                            ? "opacity-100"
                                            : "opacity-0"
                                    }`}
                                >
                                    Sorry. Nothing here!
                                </p>
                            )}
                    </div>

                    {/* View All Stories Button */}
                    <div
                        ref={viewAllButtonRef}
                        className="mt-16 mb-8 flex justify-center opacity-0 translate-y-8 transition-all duration-700 delay-300"
                    >
                        <Button
                            className="bg-[#F45151] hover:bg-[#d14343] text-white text-lg px-12 py-6 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            onClick={handleViewAllClick}
                        >
                            View All Stories
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <Footer />
        </div>
    );
}

interface CardProps {
    story: Story;
    thumbnail: string;
    handleCardClick: (story: Story) => void;
}

function Card({ story, thumbnail, handleCardClick }: CardProps) {
    if (!story || !thumbnail) {
        return null;
    }
    return (
        <div className="bg-white rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden h-full">
            <div className="relative group overflow-hidden rounded-lg">
                <img
                    src={thumbnail}
                    alt={story.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F45151]/90 to-transparent flex items-end p-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white">
                            {story.title}
                        </h3>
                        <p className="text-white/90">{story.subtitle}</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <p className="text-gray-600 mb-4">By {story.author}</p>

                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 shadow-sm text-white hover:bg-[#d14343] w-full border-2 border-[#F45151] hover:border-[#F45151] transition-all"
                    onClick={handleCardClick.bind(null, story)}
                >
                    Read Full Story
                </button>
            </div>
        </div>
    );
}
