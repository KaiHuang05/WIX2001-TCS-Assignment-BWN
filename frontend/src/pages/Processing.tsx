import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Processing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingStatus, setProcessingStatus] = useState("Processing...");

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
            {processingStatus}
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
