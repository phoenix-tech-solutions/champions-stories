import { useEffect, useRef, useState } from "react";
import Arrow from "/arrow_down.svg";
import { Button } from "@app/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import supabase, { getChampionOfStory, getRecentStories, getStory, getStoryThumbnail } from "../utils/supabase.ts";
import type { Database } from "../../../supabase.types.ts";
import AboutSection from "@app/components/AboutSection.tsx";

type Champion = Database["public"]["Tables"]["champions"]["Row"];
type Story = Database["public"]["Tables"]["stories"]["Row"];
type Thumbnail = {
  url: string;
}

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
  const [imageOpacity, setImageOpacity] = useState(0.7);
  const [isStoriesVisible, setIsStoriesVisible] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (story: Story) => {
    navigate(`/story/${story.slug}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = globalThis.scrollY;
      const viewportHeight = globalThis.innerHeight;

      if (scrollY > viewportHeight) {
        return;
      }

      const startingOpacity = 0.7;
      const opacity = startingOpacity -
        Math.min(scrollY / viewportHeight, startingOpacity);
      setImageOpacity(opacity);

      if (storiesSectionRef.current) {
        const rect = storiesSectionRef.current.getBoundingClientRect();
        setIsStoriesVisible(rect.top <= globalThis.innerHeight * 0.75);
      }
    };

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
    }, 1000); // Change title every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const [stories, setStories] = useState<Story[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [showThumbnails, setShowThumbnails] = useState(false);

  useEffect(() => {
    getRecentStories(6).then((stories) => {
      if (stories) {
        setStories(stories);

        const thumbnailPromises = stories
          .filter((story) => story.thumbnail !== null)
          .map((story) => 
            getStoryThumbnail(story)
          );
        
        Promise.all(thumbnailPromises).then((thumbnails) => {
          setThumbnails(thumbnails.filter((thumbnail) => thumbnail !== null && thumbnail !== undefined));
        });

        const champions = stories.map((story) => getChampionOfStory(story.id));
        Promise.all(champions).then((champions) => {
          setChampions(champions.filter((champion) => champion !== null && champion !== undefined));
        });
      } else {
        console.error("Failed to fetch champions");
      }
    }).catch((error) => {
      console.error("Error fetching champions:", error);
    });
    setShowThumbnails(true);
  }, []);

  return (
    <div className="scroll-smooth">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#F45151]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-[url(/home.jpg)] transition-opacity duration-500"
            style={{ opacity: imageOpacity * 0.5 }}
          />
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 animate-fade-in-up">
            Stories of{" "}
            <span style={{ ...currentTitleStyle }}>
              {currentTitle}
            </span>
          </h1>
        </div>
        <div className="absolute bottom-8 animate-bounce flex justify-center w-full">
          <img src={Arrow} className="w-12 h-12" alt="Scroll down" />
        </div>
      </section>

      <AboutSection />

      {/* Stories Section */}
      <section
        ref={storiesSectionRef}
        className=" bg-white px-4"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#F45151] mb-16 text-center">
            Recent Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {stories.length > 0 ? (
              stories.map((story, index) => (
                <Card
                  key={index}
                  story={story}
                  thumbnail={thumbnails[index]?.url || ""}
                  champion={champions[index]}
                  handleCardClick={handleCardClick}
                />
              ))
            ) : (
              <p>Sorry. Nothing here!</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Element 6 (?). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface CardProps {
  champion: Champion;
  story: Story;
  thumbnail: string; // string URL
  handleCardClick: (story: Story) => void;
}

function Card({ champion, story, thumbnail, handleCardClick }: CardProps) {
  if (!champion) {
    console.error("Champion not found", story);
    return null;
  }
  return (
    <div className="bg-white rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
      <div className="relative group overflow-hidden rounded-lg">
        <img
          src={thumbnail}
          alt={champion.name}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F45151]/90 to-transparent flex items-end p-6">
          <div>
            <h3 className="text-2xl font-bold text-white">{champion.name}</h3>
            <p className="text-white/90">{champion.sport}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">{champion.description}</p>

        <Button
          className="bg-[#F45151] hover:bg-[#d14343] w-full"
          onClick={handleCardClick.bind(null, story)}
        >
          Read Full Story
        </Button>
      </div>
    </div>
  );
}
