import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, IS_TEST_MODE } from "@/lib/api-config";
// Optional: Import Header if you want it on the loading screen, 
// but usually loading screens are clean. I will keep it clean but themed.

const Processing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingStatus, setProcessingStatus] = useState("Processing...");

  // --- LOGIC SECTION (UNTOUCHED) ---
  const processPhotoMemento = useCallback(async () => {
    try {
      const capturedImage = sessionStorage.getItem("capturedImage");
      const selectedGenre = sessionStorage.getItem("selectedGenre");
      const customPrompt = sessionStorage.getItem("customPrompt");

      console.log("Processing photo memento:", { selectedGenre, hasCustomPrompt: !!customPrompt });

      if (!capturedImage || !selectedGenre) {
        throw new Error("Missing image or genre data");
      }

      setProcessingStatus("Preparing your image...");

      // Convert base64 to blob
      const base64Response = await fetch(capturedImage);
      const blob = await base64Response.blob();

      console.log("Image blob created:", { size: blob.size, type: blob.type });

      // Create FormData
      const formData = new FormData();
      formData.append("image", blob, "photo.png");
      formData.append("genre", selectedGenre);
      
      if (selectedGenre === "custom" && customPrompt) {
        formData.append("custom_prompt", customPrompt);
      }
      
      formData.append("fidelity", "0.5");
      formData.append("output_format", "png");

      // Use test endpoint or real endpoint based on test mode
      const endpoint = IS_TEST_MODE ? API_ENDPOINTS.testStyleGuide : API_ENDPOINTS.styleGuide;
      const statusMessage = IS_TEST_MODE 
        ? "Testing connection (no credits used)..." 
        : "Applying heritage style with AI...";
      
      setProcessingStatus(statusMessage);
      console.log(`Using ${IS_TEST_MODE ? 'TEST' : 'REAL'} endpoint:`, endpoint);

      // Send to backend with longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      try {
        console.log("🚀 Sending request to backend...");
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("✅ Response received:", { 
          status: response.status, 
          ok: response.ok,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ API error response:", errorText);
          throw new Error(`Style generation failed: ${errorText}`);
        }

        console.log("📥 Reading response as blob...");
        // Get the generated image blob
        const imageBlob = await response.blob();
        console.log("✅ Generated image blob:", { size: imageBlob.size, type: imageBlob.type });
        
        console.log("🔄 Converting blob to base64...");
        // Convert blob to base64 for storage in sessionStorage
        const reader = new FileReader();
        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            console.log("✅ FileReader completed");
            resolve(reader.result as string);
          };
          reader.onerror = (err) => {
            console.error("❌ FileReader error:", err);
            reject(err);
          };
          reader.readAsDataURL(imageBlob);
        });
        
        console.log("✅ Image converted to base64, length:", imageDataUrl.length);
        
        // Store the generated image, replacing the original
        sessionStorage.setItem("capturedImage", imageDataUrl);
        
        const successMessage = IS_TEST_MODE 
          ? "✅ Test successful! Connection verified." 
          : "Complete! Redirecting...";
        
        setProcessingStatus(successMessage);
        
        // Show success toast
        toast({
          title: IS_TEST_MODE ? "Test Successful!" : "Memento Created!",
          description: IS_TEST_MODE 
            ? "Your connection is working perfectly. No credits were used!" 
            : "Your heritage-styled memento has been generated.",
        });
        
        setTimeout(() => {
          navigate("/result");
        }, IS_TEST_MODE ? 2000 : 1000);

      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error("Request timeout - the AI is taking too long. Please try again.");
        }
        throw fetchError;
      }

    } catch (error) {
      console.error("🔴 Processing error details:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        testMode: IS_TEST_MODE
      });
      
      toast({
        variant: "destructive",
        title: IS_TEST_MODE ? "Test Failed" : "Processing Error",
        description: error instanceof Error ? error.message : "Failed to generate styled image. Please try again.",
      });
      
      // Don't navigate away immediately in test mode so user can see the error
      setTimeout(() => {
        navigate("/genre-selection");
      }, IS_TEST_MODE ? 3000 : 2000);
    }
  }, [navigate, toast]);

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
      const response = await fetch(API_ENDPOINTS.voiceClone, {
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
    } else if (mementoType === "photo") {
      processPhotoMemento();
    } else {
      // Simulate AI processing time for other types
      const timer = setTimeout(() => {
        navigate("/result");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate, processAudioMemento, processPhotoMemento]);
  // --------------------------------

  return (
    // FIX 1: Applied Heritage Background
    <div className="min-h-screen bg-heritage-cream relative overflow-hidden flex flex-col items-center justify-center p-6">
      
      {/* Background Pattern (Faded) */}
      <div className="absolute inset-0 batik-pattern opacity-50 pointer-events-none" />

      {/* Test Mode Indicator */}
      {IS_TEST_MODE && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-blue-500 text-white px-6 py-2 rounded-full shadow-lg font-semibold flex items-center gap-2">
            <span className="animate-pulse">🧪</span>
            TEST MODE - No Credits Used
          </div>
        </div>
      )}

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