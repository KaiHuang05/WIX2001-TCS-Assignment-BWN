import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Processing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate AI processing time
    const timer = setTimeout(() => {
      navigate("/result");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-celebration flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
        <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "3s", animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="z-10 text-center space-y-8 max-w-md">
        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-slow" />
            <div className="absolute inset-4 rounded-full bg-white/30 animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
            <div className="absolute inset-8 rounded-full bg-white/40 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white animate-sparkle" />
            </div>
          </div>
        </div>

        <div className="space-y-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Our AI is working its magic...
          </h2>
          <p className="text-lg md:text-xl text-white/90 font-medium">
            Your special memento is just moments away!
          </p>
          <p className="text-base text-white/80">
            We're adding a beautiful frame and personalizing your memory
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-white rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: "70%" }} />
        </div>
      </div>
    </div>
  );
};

export default Processing;
