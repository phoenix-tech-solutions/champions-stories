import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "@app/components/header/Header.tsx";
import { getPublicUrl, getStory } from "@app/utils/supabase.ts";
import { Database } from "../../../../supabase.types.ts";
import { Button } from "@app/components/ui/button.tsx";
import Footer from "@app/components/Footer.tsx";

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
              entry.target.classList.add("opacity-100", "translate-y-0");
              entry.target.classList.remove("opacity-0", "translate-y-8");
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
        if (subtitleRef.current) observer.unobserve(subtitleRef.current);
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
      {/* Page load overlay animation */}
      <div
        className={`fixed inset-0 bg-[#F45151] z-50 transition-opacity duration-700 ${
          isPageLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
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


            <h3 className="text-gray-600 italic mb-20">By {story.author}</h3>

            <p
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
                .split(/(\[img-box\|[\s\S]+?\|img-box\])/g)
                .map((segment) => {
                  // Detect a full [img-box|...|img-box] block
                  const boxMatch = segment.match(
                    /^\[img-box\|([\s\S]+?)\|img-box\]$/,
                  );
                  if (boxMatch) {
                    // Inside a box: extract all image IDs ({{image:X}})
                    const inner = boxMatch[1];
                    const imageIds = [...inner.matchAll(/{{image:(\d+)}}/g)]
                      .map((m) => m[1]);

                    return (
                      <div className="max-w-[75%] mx-auto grid grid-cols-2 gap-4 auto-rows-fr my-6">
                        {imageIds.map((id) => (
                          <div key={id} className="h-full">
                            <img
                              src={getPublicUrl(`embedded/${story.slug}/${id}`)}
                              alt={`Embedded image ${id}`}
                              className="w-full h-full object-cover rounded shadow"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    // Fallback for text + single-image placeholders
                    return segment.split(/({{image:\d+}})/g).map((part, i) => {
                      const m = part.match(/{{image:(\d+)}}/);
                      if (m) {
                        const id = m[1];
                        const publicUrl = getPublicUrl(
                          `embedded/${story.slug}/${id}`,
                        );
                        return (
                          <img
                            key={i}
                            src={publicUrl}
                            alt={`Embedded image ${id}`}
                            className="my-4 mx-auto max-w-[50%] rounded shadow"
                          />
                        );
                      }
                      return <span key={i}>{part}</span>;
                    });
                  }
                })}
            </p>

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
