import { useEffect, useRef, useState } from "react";
import Arrow from "/arrow_down.svg";
import { Button } from "@app/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import supabase, { getChampionOfStory, getRecentStories, getStory, getStoryThumbnail } from "../utils/supabase.ts";
import type { Database } from "../../../supabase.types.ts";

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
  const [imageOpacity, setImageOpacity] = useState(0.1);
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

      const startingOpacity = 0.1;
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
            className="absolute inset-0 bg-cover bg-center bg-[url(/smiling.jpg)] transition-opacity duration-500"
            style={{ opacity: imageOpacity }}
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

      {/* Stories Section */}
      <section
        ref={storiesSectionRef}
        className={`min-h-screen bg-white py-20 px-4 transition-all duration-1000 ${
          isStoriesVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-20"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#F45151] mb-16 text-center">
            Recent Stories
          </h2>
          {showThumbnails && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {stories.map((story, index) => (
              <Card
                key={index}
                story={story}
                thumbnail={thumbnails[index]?.url || ""}
                champion={champions[index]}
                handleCardClick={handleCardClick}
              />
            ))}
          </div>}

          {!showThumbnails && <p>Sorry. Nothing here!</p>}
        </div>
      </section>

      {/* Featured Champions Section */}
      <section className="min-h-screen bg-[#F45151] py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Featured Champions
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/10 p-8 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-4">
                Monthly Spotlight
              </h3>
              <p className="text-white/80 mb-6">
                Discover the incredible journey of our featured athlete
              </p>
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white/10"
              >
                Meet the Champion
              </Button>
            </div>
            <div className="space-y-8">
              <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
                <h4 className="text-xl font-semibold text-white">
                  Upcoming Events
                </h4>
                <p className="text-white/80 mt-2">
                  National Wheelchair Basketball Championship - Dec 2024
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
                <h4 className="text-xl font-semibold text-white">
                  Recent Achievement
                </h4>
                <p className="text-white/80 mt-2">
                  New world record set in 100m wheelchair sprint
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="min-h-screen bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#F45151] mb-8">
            About Champions Place
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Champions Place is a unique residential facility serving adults with
            disabilities. Combining adaptive technology, specialized
            construction, and on-site caregivers, it empowers residents to live
            independently while staying connected to a vibrant community.
          </p>
          <p className="text-xl text-gray-600 mb-12">
            The vision for Champions Place began with the parents of Team
            Titans, a wheelchair sports team in Metro Atlanta, who dreamed of a
            place where their young athletes could thrive as adults. This dream
            became a reality, creating a space where stories of resilience,
            determination, and community come to life.
          </p>
          <p className="text-xl text-gray-600">
            This website celebrates those stories, honors the legacy of Garett
            Couch, and showcases the incredible connection between Champions
            Place and Innovation Academy. Join us in supporting this mission and
            helping to secure another sports wheelchair for these inspiring
            champions.
          </p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="min-h-screen bg-[#F45151] py-20 px-4 flex items-center justify-center">
        <div className="max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Share Your Story
          </h2>
          <p className="text-xl text-white/80 mb-12">
            Every champion has a story. Help us celebrate the incredible
            achievements of wheelchair athletes worldwide.
          </p>
          <div className="flex justify-center gap-6">
            <Button className="bg-white text-[#F45151] hover:bg-white/90 px-8 py-6 text-lg">
              Nominate a Champion
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              Become a Storyteller
            </Button>
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
