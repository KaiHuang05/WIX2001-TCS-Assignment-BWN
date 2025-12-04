import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, Home, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type MementoType = "photo" | "video" | "audio";

const Result = () => {
  const navigate = useNavigate();
  const [mementoType, setMementoType] = useState<MementoType>("photo");
  const [capturedData, setCapturedData] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const type = sessionStorage.getItem("mementoType") as MementoType || "photo";
    setMementoType(type);

    let data = "";
    switch (type) {
      case "photo":
        data = sessionStorage.getItem("capturedImage") || "";
        break;
      case "video":
        data = sessionStorage.getItem("capturedVideo") || "";
        break;
      case "audio":
        // For audio memento, use the generated audio instead of the original
        data = sessionStorage.getItem("generatedAudio") || sessionStorage.getItem("capturedAudio") || "";
        break;
    }

    if (!data) {
      navigate("/");
      return;
    }
    setCapturedData(data);
  }, [navigate]);

  const togglePlayPause = () => {
    if (mementoType === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (mementoType === "audio" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (!capturedData) return;

    const link = document.createElement("a");
    link.href = capturedData;
    const extension = mementoType === "photo" ? "png" : mementoType === "video" ? "webm" : mementoType === "audio" ? "wav" : "webm";
    link.download = `smart-memento-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Your memento has been downloaded!");
  };

  const handleShare = async () => {
    if (!capturedData) return;

    try {
      const response = await fetch(capturedData);
      const blob = await response.blob();
      const mimeType = mementoType === "photo" ? "image/png" : mementoType === "video" ? "video/webm" : mementoType === "audio" ? "audio/wav" : "audio/webm";
      const extension = mementoType === "photo" ? "png" : mementoType === "audio" ? "wav" : "webm";
      const file = new File([blob], `memento.${extension}`, { type: mimeType });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Smart Memento",
          text: "Check out my AI-powered event memento!",
        });
        toast.success("Thanks for sharing!");
      } else {
        toast.info("Use the download button to save and share your memento");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Unable to share. Try downloading instead!");
    }
  };

  const renderMedia = () => {
    switch (mementoType) {
      case "photo":
        return (
          <div className="w-full aspect-[3/4] max-w-md rounded-2xl overflow-hidden shadow-2xl relative border-4 border-primary/20">
            <img
              src={capturedData}
              alt="Your AI-generated memento"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-accent/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/30 to-transparent" />
            </div>
          </div>
        );
      case "video":
        return (
          <div className="relative w-full max-w-md">
            <video
              ref={videoRef}
              src={capturedData}
              className="w-full h-auto rounded-2xl shadow-2xl"
              onEnded={() => setIsPlaying(false)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/80 hover:bg-white"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-primary" />
              ) : (
                <Play className="w-8 h-8 text-primary" />
              )}
            </Button>
          </div>
        );
      case "audio":
        return (
          <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-12 flex flex-col items-center justify-center space-y-6 w-full max-w-md">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isPlaying ? 'bg-white animate-pulse' : 'bg-white/80'}`}>
                {isPlaying ? (
                  <Pause className="w-12 h-12 text-primary" />
                ) : (
                  <Play className="w-12 h-12 text-primary" />
                )}
              </div>
            </div>
            <audio
              ref={audioRef}
              src={capturedData}
              onEnded={() => setIsPlaying(false)}
            />
            <Button
              variant="hero"
              size="lg"
              onClick={togglePlayPause}
              className="text-xl px-8"
            >
              {isPlaying ? "Pause Audio" : "Play Audio"}
            </Button>
          </div>
        );
    }
  };

  if (!capturedData) {
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

        {/* Media Display */}
        <div className="animate-scale-in w-full flex justify-center">
          {renderMedia()}
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
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              sessionStorage.clear();
              navigate("/");
            }}
          >
            <RotateCcw className="w-5 h-5" />
            Create Another Memento
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Result;
