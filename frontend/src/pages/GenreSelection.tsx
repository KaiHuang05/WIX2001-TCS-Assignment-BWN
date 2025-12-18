import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Crown, Palette } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Genre = "batik" | "songket" | "vintage" | "custom";

interface GenreOption {
  id: Genre;
  title: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  colors: string;
}

const GenreSelection = () => {
  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  // Check if we have a captured image
  useState(() => {
    const image = sessionStorage.getItem("capturedImage");
    if (!image) {
      toast.error("No image found. Please capture or upload a photo first.");
      navigate("/photo-upload");
      return;
    }
    setPreviewImage(image);
  });

  const genres: GenreOption[] = [
    {
      id: "batik",
      emoji: "🎨",
      title: "Batik Heritage Postcard",
      description: "Cheerful Malaysian postcard with batik patterns and true-to-life portraits",
      icon: <Palette className="w-8 h-8" />,
      colors: "from-blue-400 to-purple-500"
    },
    {
      id: "songket",
      emoji: "👑",
      title: "Songket Royal Elegance",
      description: "Luxurious postcard with gold songket motifs and refined cultural style",
      icon: <Crown className="w-8 h-8" />,
      colors: "from-amber-400 to-yellow-600"
    },
    {
      id: "vintage",
      emoji: "📮",
      title: "Vintage Malaysian Travel Poster",
      description: "Nostalgic vintage-style postcard with muted colors and lifelike portraits",
      icon: <Sparkles className="w-8 h-8" />,
      colors: "from-orange-400 to-red-500"
    }
  ];

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
  };

  const handleProceed = () => {
    if (!selectedGenre) {
      toast.error("Please select a heritage style");
      return;
    }

    // Store the selected genre and custom prompt if applicable
    sessionStorage.setItem("selectedGenre", selectedGenre);
    if (selectedGenre === "custom" && customPrompt) {
      sessionStorage.setItem("customPrompt", customPrompt);
    }
    
    // Navigate to processing
    toast.success(`Creating your ${selectedGenre} memento...`);
    navigate("/processing");
  };

  const handleCustomize = () => {
    setShowCustomDialog(true);
  };

  const handleCustomSubmit = () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a custom prompt");
      return;
    }
    setSelectedGenre("custom");
    setShowCustomDialog(false);
    toast.success("Custom style selected!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 batik-pattern flex flex-col">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-16 w-full">
          {/* Header with Back Button */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/photo-upload")}
              className="text-[#5E4B35] hover:bg-[#5E4B35]/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#5E4B35] mb-3">
              ✨ Choose Your Heritage Style
            </h1>
            <p className="text-lg text-[#1f2b3e]/80">
              Which genre would you like to enhance your memento with more heritage elements?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Side - Image Preview */}
            <div className="order-2 md:order-1">
              <div className="sticky top-8">
                <h3 className="text-xl font-semibold text-[#5E4B35] mb-4 text-center">
                  Your Photo
                </h3>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[#D69E2E]">
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Your photo"
                      className="w-full h-auto"
                    />
                  )}
                </div>
                {selectedGenre && (
                  <div className="mt-4 p-4 bg-[#D69E2E]/10 rounded-lg border-2 border-[#D69E2E]">
                    <p className="text-center text-[#5E4B35] font-medium">
                      Selected: {genres.find(g => g.id === selectedGenre)?.emoji} {genres.find(g => g.id === selectedGenre)?.title}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Genre Options */}
            <div className="space-y-4 order-1 md:order-2">
              {genres.map((genre) => (
                <Card
                  key={genre.id}
                  className={`
                    cursor-pointer transition-all duration-300 border-2
                    ${selectedGenre === genre.id
                      ? "border-[#D69E2E] bg-[#D69E2E]/5 shadow-lg scale-[1.02]"
                      : "border-[#5E4B35]/20 hover:border-[#D69E2E]/50 hover:shadow-md"
                    }
                  `}
                  onClick={() => handleGenreSelect(genre.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className={`
                        p-3 rounded-full bg-gradient-to-br ${genre.colors} text-white
                        ${selectedGenre === genre.id ? "animate-pulse" : ""}
                      `}>
                        {genre.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl text-[#5E4B35] mb-1">
                          {genre.emoji} {genre.title}
                        </CardTitle>
                        <CardDescription className="text-[#1f2b3e]/70">
                          {genre.description}
                        </CardDescription>
                      </div>
                      {selectedGenre === genre.id && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D69E2E] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {/* Custom Option */}
              <Card
                className="cursor-pointer border-2 border-dashed border-[#5E4B35]/30 hover:border-[#D69E2E]/50 hover:bg-[#D69E2E]/5 transition-all"
                onClick={handleCustomize}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#5E4B35] mb-1">
                        🎭 Custom Style
                      </CardTitle>
                      <CardDescription className="text-[#1f2b3e]/70">
                        Create your own unique heritage blend
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => navigate("/photo-upload")}
              variant="outline"
              size="lg"
              className="border-[#5E4B35] text-[#5E4B35] hover:bg-[#5E4B35]/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Change Photo
            </Button>
            <Button
              onClick={handleProceed}
              disabled={!selectedGenre}
              size="lg"
              className={`
                ${selectedGenre 
                  ? "bg-[#D69E2E] hover:bg-[#D69E2E]/90" 
                  : "bg-gray-300 cursor-not-allowed"
                }
                text-white px-8
              `}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Memento
            </Button>
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

      {/* Custom Prompt Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#5E4B35]">
              🎭 Create Custom Style
            </DialogTitle>
            <DialogDescription>
              Describe the heritage style you want for your memento. Be specific about colors, patterns, mood, and cultural elements.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Example: Create an elegant portrait with traditional Peranakan tile patterns, vibrant turquoise and pink colors, ornate gold details, soft studio lighting, and a warm nostalgic atmosphere..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[150px] text-base"
            />
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <strong>💡 Tips:</strong> Include details about:
              </p>
              <ul className="text-sm text-amber-800 mt-2 ml-4 space-y-1 list-disc">
                <li>Cultural patterns (batik, songket, wau, etc.)</li>
                <li>Colors and mood (warm, vibrant, nostalgic)</li>
                <li>Lighting and atmosphere</li>
                <li>Background elements or settings</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomDialog(false)}
              className="border-[#5E4B35] text-[#5E4B35]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomSubmit}
              className="bg-[#D69E2E] hover:bg-[#D69E2E]/90 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Use Custom Style
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GenreSelection;
