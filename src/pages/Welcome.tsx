import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Video, Mic } from "lucide-react";
import eventLogo from "@/assets/event-logo.png";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-accent/10 animate-float" />
        <div className="absolute bottom-32 right-10 w-32 h-32 rounded-full bg-primary/10 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-20 w-16 h-16 rounded-full bg-accent/5 animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Content */}
      <div className="z-10 text-center space-y-8 max-w-2xl w-full">
        {/* Logo */}
        <div className="mb-4 animate-fade-in">
          <img 
            src={eventLogo} 
            alt="Event Logo" 
            className="w-24 h-24 mx-auto object-contain drop-shadow-xl"
          />
        </div>

        {/* Headline */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome, Creator!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            Choose your free AI-powered memento.<br />
            A smart gift from us to you!
          </p>
        </div>

        {/* Three Choice Buttons */}
        <div className="pt-6 space-y-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Link to="/capture" className="block">
            <Button 
              variant="accent" 
              size="lg"
              className="w-full text-left flex items-center gap-4 h-auto py-6 px-8 justify-start hover:scale-[1.02] transition-transform"
            >
              <Camera className="w-8 h-8 flex-shrink-0" />
              <div className="text-left">
                <div className="text-xl font-bold">🖼️ Photo Memento</div>
                <div className="text-sm opacity-80 font-normal">Get an AI-themed photo</div>
              </div>
            </Button>
          </Link>

          <Link to="/video-capture" className="block">
            <Button 
              variant="accent" 
              size="lg"
              className="w-full text-left flex items-center gap-4 h-auto py-6 px-8 justify-start hover:scale-[1.02] transition-transform"
            >
              <Video className="w-8 h-8 flex-shrink-0" />
              <div className="text-left">
                <div className="text-xl font-bold">🎬 Video Memento</div>
                <div className="text-sm opacity-80 font-normal">Star in a trendy AI reel</div>
              </div>
            </Button>
          </Link>

          <Link to="/audio-capture" className="block">
            <Button 
              variant="accent" 
              size="lg"
              className="w-full text-left flex items-center gap-4 h-auto py-6 px-8 justify-start hover:scale-[1.02] transition-transform"
            >
              <Mic className="w-8 h-8 flex-shrink-0" />
              <div className="text-left">
                <div className="text-xl font-bold">🎧 Audio Memento</div>
                <div className="text-sm opacity-80 font-normal">Hear an AI quote in your voice</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
