import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, Check, Zap, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ScannerProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
  isAnalyzing: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onCapture, onClose, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [flash, setFlash] = useState(false); // Simulate flash UI state, though web API support is limited

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not available");
      }

      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setError('Unable to access camera. Please allow permissions and ensure you are using HTTPS.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    let mounted = true;
    startCamera().then(() => {
      if (!mounted) stopCamera();
    });
    
    return () => {
      mounted = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Match canvas size to video actual size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get base64 string
        const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
        
        // Optional: play shutter sound or visual feedback
        onCapture(imageSrc);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
        </div>
        <h2 className="mt-8 text-2xl font-bold text-white">Analyzing Food...</h2>
        <p className="mt-2 text-gray-400">Identifying ingredients and calculating calories.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <button 
          onClick={onClose} 
          className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition"
        >
          <X size={24} />
        </button>
        <span className="text-white font-medium tracking-wide">Scan Meal</span>
        <button 
          onClick={() => setFlash(!flash)}
          className={`p-2 rounded-full backdrop-blur-md transition ${flash ? 'bg-yellow-500/80 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          <Zap size={24} />
        </button>
      </div>

      {/* Camera Viewport */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white p-6 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scanner Overlay */}
        <div className="absolute inset-0 pointer-events-none border-2 border-white/20 m-8 rounded-2xl flex flex-col justify-between p-4">
            <div className="flex justify-between">
                <div className="w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                <div className="w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
            </div>
            <div className="flex justify-between">
                <div className="w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                <div className="w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-lg pb-8 pt-6 px-8 rounded-t-3xl border-t border-white/10">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          <label className="p-4 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <ImageIcon size={24} />
          </label>
          
          <button 
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent relative group"
          >
            <div className="w-16 h-16 rounded-full bg-white group-active:scale-90 transition-transform duration-100"></div>
          </button>
          
          <div className="w-14"></div> {/* Spacer for balance */}
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">Place food within the frame</p>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-150px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(150px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;