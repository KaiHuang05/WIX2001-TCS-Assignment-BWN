import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type MementoType = "photo" | "video" | "audio";

const Result = () => {
  const navigate = useNavigate();
  const [mementoType, setMementoType] = useState<MementoType>("photo");
  const [capturedData, setCapturedData] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- LOGIC SECTION (UNTOUCHED) ---
  useEffect(() => {
    const type = sessionStorage.getItem("mementoType") as MementoType || "photo";
    const videoMode = sessionStorage.getItem("videoMode");
    setMementoType(type);

    let data = "";
    switch (type) {
      case "photo":
        data = sessionStorage.getItem("capturedImage") || "";
        break;
      case "video":
        // Check if it's a generated montage or recorded video
        if (videoMode === "montage") {
          data = sessionStorage.getItem("generatedVideo") || "";
        } else {
          data = sessionStorage.getItem("capturedVideo") || "";
        }
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
    const videoMode = sessionStorage.getItem("videoMode");
    
    // Determine file extension based on type and mode
    let extension = "png";
    if (mementoType === "photo") {
      extension = "png";
    } else if (mementoType === "video") {
      extension = videoMode === "montage" ? "mp4" : "webm";
    } else if (mementoType === "audio") {
      extension = "wav";
    }
    
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
  // --------------------------------

  const renderMedia = () => {
    switch (mementoType) {
      case "photo":
        return (
          // Display image with preserved aspect ratio
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative border-8 border-[#D69E2E] bg-white">
            <img
              src={capturedData}
              alt="Your AI-generated memento"
              className="w-full h-auto object-contain"
            />
            {/* Vintage Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-sepia mix-blend-overlay"></div>
          </div>
        );
      case "video":
        return (
          <div className="relative w-full max-w-md">
            {/* FIX: Added Gold Border */}
            <div className="rounded-2xl overflow-hidden border-4 border-[#D69E2E] shadow-2xl">
              <video
                ref={videoRef}
                src={capturedData}
                className="w-full h-auto"
                onEnded={() => setIsPlaying(false)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/80 hover:bg-white text-[#1f2b3e]"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </Button>
          </div>
        );
      case "audio":
        return (
          // FIX: Audio Player Card Theme (Navy Background)
          <div className="bg-[#1f2b3e] rounded-2xl p-10 flex flex-col items-center justify-center space-y-6 w-full max-w-md shadow-2xl border-2 border-[#D69E2E]">
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center border-2 border-[#D69E2E]/30">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-[#D69E2E] animate-pulse text-white' : 'bg-white text-[#1f2b3e]'}`}>
                {isPlaying ? (
                  <Pause className="w-10 h-10 fill-current" />
                ) : (
                  <Play className="w-10 h-10 fill-current ml-1" />
                )}
              </div>
            </div>
            <audio
              ref={audioRef}
              src={capturedData}
              onEnded={() => setIsPlaying(false)}
            />
            <Button
              size="lg"
              onClick={togglePlayPause}
              className="text-lg px-8 py-6 bg-[#D69E2E] hover:bg-[#B8860B] text-white"
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
    // FIX: Layout Structure (Header -> Main(Batik) -> Footer)
    <div className="min-h-screen bg-heritage-cream flex flex-col relative">
      <Header />

      <main className="flex-1 batik-pattern flex flex-col items-center p-6">
        <div className="max-w-2xl mx-auto w-full space-y-8 py-8">
          
          {/* Title Section */}
          <div className="text-center space-y-2 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-[#D69E2E] animate-sparkle" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1f2b3e]">
                Your Memento
              </h1>
              <Sparkles className="w-6 h-6 text-[#D69E2E] animate-sparkle" style={{ animationDelay: "0.5s" }} />
            </div>
            <p className="text-[#A65D37] font-medium">
              A piece of heritage, reimagined for you.
            </p>
          </div>

          {/* Media Display */}
          <div className="animate-scale-in w-full flex justify-center">
            {renderMedia()}
          </div>

          {/* Smart Giving Message - Card Style Update */}
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#D69E2E]/30 shadow-sm">
              <p className="text-lg font-bold text-[#1f2b3e] mb-2 flex items-center justify-center gap-2">
                ✨ Smart Giving
              </p>
              <p className="text-[#1f2b3e]/80 text-sm leading-relaxed">
                Share your memory to celebrate our community! Every shared moment brings us closer together.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-md mx-auto space-y-3 pt-2">
            <Button
              size="lg"
              className="w-full h-14 text-lg bg-[#1f2b3e] hover:bg-[#1f2b3e]/90 text-white shadow-lg"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share My Memento
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg border-2 border-[#1f2b3e] text-[#1f2b3e] hover:bg-[#1f2b3e]/5 bg-transparent"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5 mr-2" />
              Download
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full text-[#A65D37] hover:text-[#8B4513] hover:bg-[#A65D37]/10"
              onClick={() => {
                sessionStorage.clear();
                navigate("/");
              }}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Create Another Memento
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Result;