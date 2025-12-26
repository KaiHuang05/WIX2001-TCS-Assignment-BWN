import { Link } from "react-router-dom"; 
// Removed { Camera, Film, Mic } import as we are using PNGs now

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MementoCard from "@/components/MementoCard";

const Welcome = () => { 
  const mementos = [
    {
      // CHANGED: Points to your PNG file in the public folder
      iconSrc: "/camera.png", 
      title: "Photo Memento",
      description: "Create your heritage-inspired AI souvenirs infused with rich cultural details and timeless elegance",
      path: "/photo-upload" 
    },
    {
      // CHANGED: Points to your PNG file
      iconSrc: "/video.png",
      title: "Video Memento",
      description: "Create an AI-powered video montage from your photos with smart music selection",
      path: "/video-capture" 
    },
    {
      // CHANGED: Points to your PNG file
      iconSrc: "/audio.png",
      title: "Audio Memento",
      description: "Hear your AI-voiced heritage story narrated in Malaysian storytelling tradition",
      path: "/audio-capture" 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 batik-pattern flex flex-col">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 w-full">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#5E4B35] mb-4 animate-fade-in">
              Welcome, Creator!
            </h1>
            <p className="text-lg md:text-xl text-[#1f2b3e] animate-fade-in" style={{ animationDelay: "100ms" }}>
              Choose your free AI-powered heritage memento
            </p>
          </div>

          {/* Memento Cards */}
          <div className="flex flex-col gap-5">
            {mementos.map((memento, index) => (
              <Link to={memento.path} key={memento.title} className="block group">
                <MementoCard
                  // CHANGED: Passing the iconSrc string instead of an icon component
                  iconSrc={memento.iconSrc} 
                  title={memento.title}
                  description={memento.description}
                  delay={200 + index * 100}
                />
              </Link>
            ))}
          </div>          
        </div>
        
        {/* Ornament Block */}
        <div className="flex justify-center pb-8 mt-auto">
            <img 
              src="/footer-ornament.png" 
              alt="Heritage Ornament" 
              className="h-5 w-auto opacity-80" 
            />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Welcome;