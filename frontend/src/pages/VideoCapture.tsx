import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Video, Square, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VideoCapture = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access camera and microphone. Please check permissions.",
      });
    }
  };

  const switchCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        sessionStorage.setItem("capturedVideo", base64data);
        sessionStorage.setItem("mementoType", "video");
        navigate("/processing");
      };
      reader.readAsDataURL(blob);
    };

    setIsRecording(true);
    mediaRecorder.start();

    // Auto-stop after 10 seconds
    setTimeout(() => {
      stopRecording();
    }, 10000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Camera Preview */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Instructions */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent">
          <p className="text-white text-center text-lg font-medium">
            {isRecording ? "Recording... Hold still!" : "We just need your face! Hold still and look at the camera."}
          </p>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-bold">REC</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-sm p-6 space-y-4">
        <div className="flex justify-center items-center gap-8">
          {/* Switch Camera */}
          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            disabled={isRecording}
            className="text-white hover:bg-white/20 w-14 h-14 rounded-full"
          >
            <RefreshCw className="w-6 h-6" />
          </Button>

          {/* Record/Stop Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full border-4 ${
              isRecording 
                ? "border-red-500 bg-red-500 hover:bg-red-600" 
                : "border-white bg-transparent hover:bg-white/20"
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Video className="w-8 h-8 text-white" />
            )}
          </Button>

          {/* Spacer for symmetry */}
          <div className="w-14 h-14" />
        </div>

        {/* Info Text */}
        <p className="text-white/70 text-center text-sm">
          {isRecording ? "Recording will auto-stop in 10 seconds" : "Tap to record for 10 seconds"}
        </p>
      </div>
    </div>
  );
};

export default VideoCapture;
