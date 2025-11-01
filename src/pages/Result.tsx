import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, Home } from "lucide-react";
import { toast } from "sonner";

const Result = () => {
  const navigate = useNavigate();
  const [imageData, setImageData] = useState<string>("");

  useEffect(() => {
    const stored = sessionStorage.getItem("capturedImage");
    if (!stored) {
      navigate("/");
      return;
    }
    setImageData(stored);
  }, [navigate]);

  const handleDownload = () => {
    if (!imageData) return;

    const link = document.createElement("a");
    link.href = imageData;
    link.download = `smart-memento-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Your memento has been downloaded!");
  };

  const handleShare = async () => {
    if (!imageData) return;

    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], "memento.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Smart Memento",
          text: "Check out my AI-powered event memento!",
        });
        toast.success("Thanks for sharing!");
      } else {
        // Fallback: copy link or show message
        toast.info("Use the download button to save and share your memento");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Unable to share. Try downloading instead!");
    }
  };

  if (!imageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Memento
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Success message with animation */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-accent animate-sparkle" />
            <h2 className="text-2xl font-bold text-foreground">
              Your memento is ready!
            </h2>
            <Sparkles className="w-6 h-6 text-accent animate-sparkle" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Image Display */}
        <div className="w-full aspect-[3/4] max-w-md rounded-2xl overflow-hidden shadow-2xl relative animate-scale-in border-4 border-primary/20">
          <img
            src={imageData}
            alt="Your AI-generated memento"
            className="w-full h-full object-cover"
          />
          {/* Decorative frame overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-accent/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/30 to-transparent" />
          </div>
        </div>

        {/* Smart Giving Message */}
        <div className="text-center space-y-4 max-w-md">
          <div className="bg-secondary/50 rounded-xl p-4 border border-primary/20">
            <p className="text-lg font-semibold text-primary mb-2">
              ✨ Smart Giving
            </p>
            <p className="text-muted-foreground">
              Share your memory to celebrate our community! Every shared moment brings us closer together.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-3 pt-4">
          <Button
            variant="hero"
            size="lg"
            className="w-full h-14 text-base"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
            Share My Memento
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-base"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5" />
            Download
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => {
              sessionStorage.removeItem("capturedImage");
              navigate("/");
            }}
          >
            Create Another Memento
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Result;
