import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Camera } from "lucide-react";
import eventLogo from "@/assets/event-logo.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-accent/10 animate-float" />
        <div className="absolute bottom-32 right-10 w-32 h-32 rounded-full bg-primary/10 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-20 w-16 h-16 rounded-full bg-accent/5 animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center flex-1 z-10 max-w-2xl w-full">
        <div className="mb-8 animate-float">
          <img 
            src={eventLogo} 
            alt="Smart Mementos Event Logo" 
            className="w-64 h-auto rounded-2xl shadow-2xl"
          />
        </div>

        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-accent animate-sparkle" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to the Event!
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-sparkle" style={{ animationDelay: "1s" }} />
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground font-medium px-4">
            Let's create your unique AI-powered memento
          </p>

          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto px-4">
            Capture a special moment and watch as our AI transforms it into a beautiful, personalized keepsake you'll treasure forever.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-md z-10 pb-8">
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full h-16 text-lg"
          onClick={() => navigate("/capture")}
        >
          <Camera className="w-6 h-6" />
          Create My Memento
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
