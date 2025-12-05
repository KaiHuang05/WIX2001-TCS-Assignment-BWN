import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Play, RotateCcw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header"; // Added Header for consistency

const AudioCapture = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [malayText, setMalayText] = useState<string>("");
  const [showTextInput, setShowTextInput] = useState(false);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  }, [toast]);

  useEffect(() => {
    requestMicrophonePermission();
  }, [requestMicrophonePermission]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setHasRecording(true);
        stream.getTracks().forEach(track => track.stop());
      };

      setIsRecording(true);
      setRecordingTime(0);
      mediaRecorder.start();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Could not start recording. Please try again.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const reRecord = () => {
    setHasRecording(false);
    setIsPlaying(false);
    setRecordingTime(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl("");
  };

  const confirmRecording = () => {
    // Show text input instead of proceeding immediately
    setShowTextInput(true);
  };

  const submitMementoData = () => {
    if (!malayText.trim()) {
      toast({
        variant: "destructive",
        title: "Text Required",
        description: "Please enter the text in Malay.",
      });
      return;
    }

    if (audioUrl) {
      fetch(audioUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            sessionStorage.setItem("capturedAudio", base64data);
            sessionStorage.setItem("malayText", malayText);
            sessionStorage.setItem("mementoType", "audio");
            navigate("/processing");
          };
          reader.readAsDataURL(blob);
        });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    // FIX 1: Changed background to Cream + Batik Pattern to match other pages
    <div className="min-h-screen flex flex-col bg-heritage-cream">
      {/* Optional: Add Header for consistency */}
      <Header />

      <main className="flex-1 batik-pattern flex flex-col items-center justify-center p-6">
        <audio 
          ref={audioRef} 
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="max-w-md w-full space-y-8 text-center">
          
          {/* Icon and Title */}
          <div className="space-y-4">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-100 border-4 border-red-500 animate-pulse' // Recording State
                : 'bg-white border-4 border-[#D69E2E] shadow-md' // Idle State (White circle with Gold border)
            }`}>
              {/* FIX 2: Changed Icon Color (Red if recording, Gold/Brown if idle) */}
              <Mic className={`w-16 h-16 ${isRecording ? 'text-red-500' : 'text-[#A65D37]'}`} />
            </div>
            
            {/* FIX 3: Changed Text Color from White to Dark Blue (#1f2b3e) */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1f2b3e]">
              {isRecording ? "Recording..." : hasRecording ? "Recording Complete!" : "Audio Memento"}
            </h1>
            
            {isRecording && (
              <p className="text-2xl font-mono text-red-500 font-bold">{formatTime(recordingTime)}</p>
            )}
          </div>

          {/* Instructions */}
          {!isRecording && !hasRecording && (
            // FIX 4: Updated card style (White background, shadow, dark text)
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-heritage-gold/20">
              <p className="text-[#1f2b3e] text-lg leading-relaxed">
                Tap the mic and say a short phrase, like <span className="font-bold text-[#A65D37]">"I'm here at the community fair!"</span>
                <br /><br />
                We'll use your voice to generate an awesome quote.
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-4">
            {!hasRecording ? (
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                // FIX 5: Updated Button Colors (Navy Blue background)
                className={`w-full text-xl py-8 hover:scale-[1.02] transition-transform ${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-heritage-navy hover:bg-heritage-navy/90 text-white"
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-6 h-6 mr-2 fill-current" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-2" />
                    Tap to Record
                  </>
                )}
              </Button>
            ) : !showTextInput ? (
              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={playRecording}
                  disabled={isPlaying}
                  className="w-full text-xl py-6 bg-heritage-navy hover:bg-heritage-navy/90 text-white"
                >
                  <Play className={`w-6 h-6 mr-2 ${isPlaying ? 'fill-current' : ''}`} />
                  {isPlaying ? "Playing..." : "Play Recording"}
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={reRecord}
                    className="flex-1 text-lg py-6 border-[#1f2b3e] text-[#1f2b3e] hover:bg-gray-100"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Re-record
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={confirmRecording}
                    className="flex-1 text-lg py-6 bg-[#A65D37] hover:bg-[#8B4513] text-white"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Use This Voice
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-left shadow-sm border border-heritage-gold/20">
                  <label className="text-[#1f2b3e] text-lg font-semibold mb-2 block">
                    Enter your text in Malay:
                  </label>
                  {/* FIX 6: Updated Textarea style for light background */}
                  <Textarea
                    value={malayText}
                    onChange={(e) => setMalayText(e.target.value)}
                    placeholder="Tulis teks anda dalam Bahasa Melayu..."
                    className="min-h-[120px] bg-white border-gray-300 text-[#1f2b3e] placeholder:text-gray-400 text-lg resize-none focus:ring-heritage-gold"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    This text will be spoken using your voice
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowTextInput(false)}
                    className="flex-1 text-lg py-6 border-[#1f2b3e] text-[#1f2b3e] hover:bg-gray-100"
                  >
                    Back
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={submitMementoData}
                    className="flex-1 text-lg py-6 bg-heritage-navy hover:bg-heritage-navy/90 text-white"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Generate Voice
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AudioCapture;