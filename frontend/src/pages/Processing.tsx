import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Optional: Import Header if you want it on the loading screen, 
// but usually loading screens are clean. I will keep it clean but themed.

const Processing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingStatus, setProcessingStatus] = useState("Processing...");

  // --- LOGIC SECTION (UNTOUCHED) ---
  const processAudioMemento = useCallback(async () => {
    try {
      const capturedAudio = sessionStorage.getItem("capturedAudio");
      const malayText = sessionStorage.getItem("malayText");

      if (!capturedAudio || !malayText) {
        throw new Error("Missing audio or text data");
      }

      setProcessingStatus("Converting your audio...");

      // Convert base64 to blob
      const base64Response = await fetch(capturedAudio);
      const blob = await base64Response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append("audio_file", blob, "voice_sample.webm");
      formData.append("text", malayText);

      setProcessingStatus("Generating voice with Chatterbox...");

      // Send to backend
      const response = await fetch("http://localhost:8000/api/voice-clone", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Voice generation failed");
      }

      const audioBlob = await response.blob();
      
      // Convert blob to base64 for storage in sessionStorage
      const reader = new FileReader();
      const audioDataUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      
      // Store the generated audio as data URL (not blob URL)
      sessionStorage.setItem("generatedAudio", audioDataUrl);
      
      setProcessingStatus("Complete! Redirecting...");
      
      setTimeout(() => {
        navigate("/result");
      }, 1000);

    } catch (error) {
      console.error("Processing error:", error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to generate voice. Please try again.",
      });
      
      setTimeout(() => {
        navigate("/audio-capture");
      }, 2000);
    }
  }, [navigate, toast]);

  useEffect(() => {
    const mementoType = sessionStorage.getItem("mementoType");
    
    if (mementoType === "audio") {
      processAudioMemento();
    } else {
      // Simulate AI processing time for other types
      const timer = setTimeout(() => {
        navigate("/result");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate, processAudioMemento]);
  // --------------------------------

  return (
    // FIX 1: Applied Heritage Background
    <div className="min-h-screen bg-heritage-cream relative overflow-hidden flex flex-col items-center justify-center p-6">
      
      {/* Background Pattern (Faded) */}
      <div className="absolute inset-0 batik-pattern opacity-50 pointer-events-none" />

      {/* Content */}
      <div className="z-10 text-center space-y-8 max-w-md w-full">
        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-8 relative">
            {/* FIX 2: Updated Pulse Colors to Gold/Cream */}
            <div className="absolute inset-0 rounded-full bg-[#D69E2E]/20 animate-pulse-slow" />
            <div className="absolute inset-4 rounded-full bg-[#D69E2E]/30 animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
            
            {/* FIX 3: Center Circle is now Heritage Navy */}
            <div className="absolute inset-8 rounded-full bg-[#1f2b3e] flex items-center justify-center shadow-xl">
              <Sparkles className="w-12 h-12 text-[#D69E2E] animate-sparkle" />
            </div>
          </div>
        </div>

        <div className="space-y-4 animate-fade-in">
          {/* FIX 4: Typography Updated to Dark Blue */}
          <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1f2b3e]">
            Our AI is working its magic...
          </h2>
          <p className="text-lg md:text-xl text-[#1f2b3e]/80 font-medium font-sans">
            Your special memento is just moments away!
          </p>
          <p className="text-base text-[#A65D37] font-semibold">
            {processingStatus}
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden border border-[#D69E2E]/30">
          {/* FIX 5: Progress Bar is now Gold */}
          <div className="h-full bg-[#D69E2E] rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: "70%" }} />
        </div>
      </div>
    </div>
  );
};

export default Processing;