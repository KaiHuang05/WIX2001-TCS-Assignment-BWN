import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header"; // Added Header for consistency

const AudioCapture = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [malayText, setMalayText] = useState<string>("");
  const [showVoiceSelection, setShowVoiceSelection] = useState(false);
  const [voiceType, setVoiceType] = useState<string>("female"); // "male", "female"
  const [showTextInput, setShowTextInput] = useState(true); // Start with text input

  // No microphone permissions needed for text-based voice generation

  const handleTextSubmit = () => {
    if (!malayText.trim()) {
      toast({
        variant: "destructive",
        title: "Text Required",
        description: "Please enter some text in Malay.",
      });
      return;
    }
    setShowTextInput(false);
    setShowVoiceSelection(true);
  };

  const selectVoiceType = (type: string) => {
    setVoiceType(type);
    setShowVoiceSelection(false);
    // Proceed to processing
    submitVoiceGeneration(type);
  };

  const backToTextInput = () => {
    setShowVoiceSelection(false);
    setShowTextInput(true);
  };

  const submitVoiceGeneration = (selectedVoiceType: string) => {
    // Create a dummy audio blob since backend expects it but we won't use it for male/female voices
    const dummyBlob = new Blob([''], { type: 'audio/wav' });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      sessionStorage.setItem("capturedAudio", base64data);
      sessionStorage.setItem("malayText", malayText);
      sessionStorage.setItem("voiceType", selectedVoiceType);
      sessionStorage.setItem("mementoType", "audio");
      navigate("/processing");
    };
    reader.readAsDataURL(dummyBlob);
  };

  // All recording functions removed - now using text-based voice generation only

  return (
    // FIX 1: Changed background to Cream + Batik Pattern to match other pages
    <div className="min-h-screen flex flex-col bg-heritage-cream">
      {/* Optional: Add Header for consistency */}
      <Header />

      <main className="flex-1 batik-pattern flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          
          {/* Icon and Title */}
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center bg-white border-4 border-[#D69E2E] shadow-md">
              <Sparkles className="w-16 h-16 text-[#A65D37]" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1f2b3e]">
              Text to Speech
            </h1>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            {showTextInput ? (
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-heritage-gold/20">
                  <p className="text-[#1f2b3e] text-lg mb-4">
                    Enter your text in Malay and we'll generate it with a beautiful voice!
                  </p>
                  
                  <label className="text-[#1f2b3e] text-lg font-semibold mb-2 block text-left">
                    Your Text in Malay:
                  </label>
                  <Textarea
                    value={malayText}
                    onChange={(e) => setMalayText(e.target.value)}
                    placeholder="Tulis teks anda dalam Bahasa Melayu..."
                    className="min-h-[120px] bg-white border-gray-300 text-[#1f2b3e] placeholder:text-gray-400 text-lg resize-none focus:ring-heritage-gold"
                  />
                </div>

                <Button
                  size="lg"
                  onClick={handleTextSubmit}
                  className="w-full text-xl py-6 bg-heritage-navy hover:bg-heritage-navy/90 text-white"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Continue to Voice Selection
                </Button>
              </div>
            ) : showVoiceSelection ? (
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-sm border border-heritage-gold/20">
                  <h3 className="text-[#1f2b3e] text-xl font-semibold mb-4">
                    Choose Voice Type
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select how you want your text to be spoken
                  </p>
                  
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      onClick={() => selectVoiceType("female")}
                      className="w-full text-lg py-6 bg-[#A65D37] hover:bg-[#8B4513] text-white text-left"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">👩 Female Voice (Yasmin)</span>
                        <span className="text-sm opacity-90">Professional female Malay voice</span>
                      </div>
                    </Button>
                    
                    <Button
                      size="lg"
                      onClick={() => selectVoiceType("male")}
                      className="w-full text-lg py-6 bg-heritage-gold hover:bg-heritage-gold/90 text-[#1f2b3e] text-left"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">👨 Male Voice (Osman)</span>
                        <span className="text-sm opacity-75">Professional male Malay voice</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={backToTextInput}
                  className="w-full text-lg py-6 border-[#1f2b3e] text-[#1f2b3e] hover:bg-gray-100"
                >
                  Back to Text Input
                </Button>
              </div>
            ) : null}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AudioCapture;