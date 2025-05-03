import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getStory } from "@app/utils/supabase.ts";
import { Database } from "../../../../supabase.types.ts";
import { Button } from "@app/components/ui/button.tsx";

type Story = Database["public"]["Tables"]["stories"]["Row"];

export default function Story() {
  const { selectedStorySlug } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      if (!selectedStorySlug) {
        navigate("/stories");
        return;
      }

      try {
        const fetchedStory = await getStory(selectedStorySlug);
        if (!fetchedStory) {
          navigate("/stories");
          return;
        }
        setStory(fetchedStory);
      } catch (error) {
        console.error("Error fetching story:", error);
        navigate("/stories");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [selectedStorySlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F45151] text-white">
        <p>Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {
          /* <div className="absolute inset-0 bg-[#F45151]">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${story.image_url})` }}
                    />
                </div> */
        }
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            {story.body}
          </h1>

          {story.subtitle && (
            <p className="text-xl text-white/90">{story.subtitle}</p>
          )}
        </div>
      </section>

      {/* Story Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[#F45151] mb-8">
            {story.title}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            {story.body}
          </p>
          <Button
            className="bg-[#F45151] hover:bg-[#d14343] text-white px-8 py-4"
            onClick={() => navigate("/stories")}
          >
            Back to Stories
          </Button>
        </div>
      </section>
    </div>
  );
}
