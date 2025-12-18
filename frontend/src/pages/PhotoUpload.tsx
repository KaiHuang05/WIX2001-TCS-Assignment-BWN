import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PhotoUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setPreviewImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
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
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleProceedToGenre = () => {
    if (!previewImage) {
      toast.error("Please select or capture a photo first");
      return;
    }
    
    // Store image and navigate to genre selection
    sessionStorage.setItem("capturedImage", previewImage);
    sessionStorage.setItem("mementoType", "photo");
    navigate("/genre-selection");
  };

  const handleTakePhoto = () => {
    navigate("/capture");
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
              📸 Photo Memento
            </h1>
            <p className="text-lg text-[#1f2b3e]/80">
              Upload a photo or take a new picture to create your heritage-inspired memento
            </p>
          </div>

          {/* Preview or Upload Area */}
          {previewImage ? (
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[#D69E2E] max-w-md mx-auto">
                <img
                  src={previewImage}
                  alt="Selected photo"
                  className="w-full h-auto"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewImage("")}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-[#1f2b3e] rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setPreviewImage("")}
                  variant="outline"
                  className="border-[#5E4B35] text-[#5E4B35] hover:bg-[#5E4B35]/10"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Different Photo
                </Button>
                <Button
                  onClick={handleProceedToGenre}
                  className="bg-[#D69E2E] hover:bg-[#D69E2E]/90 text-white"
                >
                  Next: Choose Style
                  <span className="ml-2">→</span>
                </Button>
              </div>
            </div>
          ) : (
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
                    <ImageIcon className="w-10 h-10 text-[#D69E2E]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#5E4B35] mb-2">
                      Upload Your Photo
                    </h3>
                    <p className="text-[#1f2b3e]/70">
                      Drag and drop an image here, or click to browse
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
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#5E4B35]/20"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 text-[#1f2b3e]/60 font-medium">
                    OR
                  </span>
                </div>
              </div>

              {/* Take Photo Button */}
              <Button
                onClick={handleTakePhoto}
                className="w-full py-6 bg-[#1f2b3e] hover:bg-[#1f2b3e]/90 text-white text-lg"
              >
                <Camera className="w-6 h-6 mr-3" />
                Take a Photo with Camera
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

export default PhotoUpload;
