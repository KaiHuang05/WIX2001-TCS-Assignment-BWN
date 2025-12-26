import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Sparkles, Video } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface MusicCategory {
  id: string;
  name: string;
  description: string;
}

const VideoCapture = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedMusicCategory, setSelectedMusicCategory] = useState<string>("auto");
  const [musicCategories, setMusicCategories] = useState<MusicCategory[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadMusicCategories();
  }, []);

  const loadMusicCategories = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.autoVlogCategories);
      const data = await response.json();
      setMusicCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load music categories:", error);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    let filesProcessed = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        filesProcessed++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        newImages.push(imageData);
        filesProcessed++;

        if (filesProcessed === files.length) {
          setUploadedImages(prev => {
            const combined = [...prev, ...newImages];
            if (combined.length > 20) {
              toast.warning("Maximum 20 images allowed. Extra images ignored.");
              return combined.slice(0, 20);
            }
            return combined;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateMontage = async () => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    // Store images and settings for processing
    sessionStorage.setItem("montageImages", JSON.stringify(uploadedImages));
    sessionStorage.setItem("musicCategory", selectedMusicCategory);
    sessionStorage.setItem("mementoType", "video");
    sessionStorage.setItem("videoMode", "montage");
    
    navigate("/processing");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 batik-pattern flex flex-col">
        <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 w-full">
          {/* Header with Back Button */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-[#5E4B35] hover:bg-[#5E4B35]/10"
            >
              <X className="w-5 h-5 mr-2" />
              Back
            </Button>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#5E4B35] mb-3">
              🎬 Video Memento
            </h1>
            <p className="text-lg text-[#1f2b3e]/80">
              Upload photos and let AI create a stunning video with perfect music
            </p>
          </div>

          {/* Main Content Area */}
          {uploadedImages.length === 0 ? (
            <div className="space-y-6">
              {/* Upload Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-4 border-dashed rounded-2xl p-12 
                  transition-all duration-300 cursor-pointer
                  ${isDragging 
                    ? "border-[#D69E2E] bg-[#D69E2E]/10" 
                    : "border-[#5E4B35]/30 bg-white/50 hover:border-[#D69E2E] hover:bg-[#D69E2E]/5"
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#D69E2E]/20 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-[#D69E2E]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#5E4B35] mb-2">
                      Upload Photos for Your Video Montage
                    </h3>
                    <p className="text-[#1f2b3e]/70">
                      Drag & drop or click to upload (1-20 images)
                    </p>
                    <p className="text-sm text-[#1f2b3e]/50 mt-2">
                      Supports: JPG, PNG, WEBP
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Gallery */}
              <div className="bg-white/50 rounded-2xl p-6 border-2 border-[#5E4B35]/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#5E4B35]">
                    Selected Images ({uploadedImages.length}/20)
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#D69E2E] hover:bg-[#D69E2E]/10"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add More
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-[#5E4B35]/20"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Music Category Selector */}
              <div className="bg-white/50 rounded-2xl p-6 border-2 border-[#5E4B35]/20">
                <label className="block mb-3">
                  <span className="text-lg font-semibold text-[#5E4B35]">
                    Background Music 🎵
                  </span>
                </label>
                <select
                  value={selectedMusicCategory}
                  onChange={(e) => setSelectedMusicCategory(e.target.value)}
                  className="w-full bg-white border-2 border-[#5E4B35]/30 text-[#1f2b3e] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D69E2E] focus:border-transparent"
                >
                  {musicCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} - {cat.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateMontage}
                className="w-full py-6 bg-[#D69E2E] hover:bg-[#D69E2E]/90 text-white text-lg font-semibold rounded-xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Video Montage
              </Button>

              {/* Reset Button */}
              <Button
                onClick={() => setUploadedImages([])}
                variant="outline"
                className="w-full border-[#5E4B35] text-[#5E4B35] hover:bg-[#5E4B35]/10"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Images
              </Button>
            </div>
          )}
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

export default VideoCapture;
