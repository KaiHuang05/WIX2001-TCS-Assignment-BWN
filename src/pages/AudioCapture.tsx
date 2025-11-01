import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, RotateCcw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    requestMicrophonePermission();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  };

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
    if (audioUrl) {
      fetch(audioUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            sessionStorage.setItem("capturedAudio", base64data);
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
    <div className="min-h-screen gradient-accent flex flex-col items-center justify-center p-6">
      <audio 
        ref={audioRef} 
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon and Title */}
        <div className="space-y-4">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/20'
          }`}>
            <Mic className={`w-16 h-16 ${isRecording ? 'text-white' : 'text-white'}`} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {isRecording ? "Recording..." : hasRecording ? "Recording Complete!" : "Audio Memento"}
          </h1>
          
          {isRecording && (
            <p className="text-2xl font-mono text-white">{formatTime(recordingTime)}</p>
          )}
        </div>

        {/* Instructions */}
        {!isRecording && !hasRecording && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-white text-lg leading-relaxed">
              Tap the mic and say a short phrase, like <span className="font-bold">"I'm here at the community fair!"</span>
              <br /><br />
              We'll use your voice to generate an awesome quote.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          {!hasRecording ? (
            <Button
              variant="hero"
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className="w-full text-xl py-8"
            >
              {isRecording ? (
                <>
                  <Square className="w-6 h-6 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6 mr-2" />
                  Tap to Record
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                variant="hero"
                size="lg"
                onClick={playRecording}
                disabled={isPlaying}
                className="w-full text-xl py-6"
              >
                <Play className="w-6 h-6 mr-2" />
                {isPlaying ? "Playing..." : "Play Recording"}
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={reRecord}
                  className="flex-1 text-lg py-6 bg-white/10 border-white text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Re-record
                </Button>
                
                <Button
                  variant="hero"
                  size="lg"
                  onClick={confirmRecording}
                  className="flex-1 text-lg py-6"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Use This Voice
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioCapture;
