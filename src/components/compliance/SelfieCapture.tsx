import React, { useRef, useState, useCallback, useEffect } from 'react';

interface SelfieCaptureProps {
  onNext: () => void;
  onPrev: () => void;
  updateData: (data: any) => void;
  data: any;
}

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({ onNext, onPrev, updateData, data }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(!!data.selfie);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please grant camera permissions to continue.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (!captured) {
      startCamera();
    }
    return () => stopCamera();
  }, [captured, startCamera, stopCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
            updateData({ selfie: file });
            setCaptured(true);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const retake = () => {
    setCaptured(false);
    updateData({ selfie: undefined });
  };

  return (
    <div className="space-y-8 animate-in mt-4 slide-in-from-right-4 duration-500">
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-md aspect-square bg-gray-900 rounded-[2.5rem] border-8 border-white shadow-2xl overflow-hidden ring-1 ring-gray-100">
          {!captured ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <img 
              src={URL.createObjectURL(data.selfie)} 
              alt="Selfie" 
              className="w-full h-full object-cover" 
            />
          )}
          
          <div className="absolute inset-x-0 bottom-8 flex justify-center gap-4 px-6 z-10 transition-all">
            {!captured ? (
              <button 
                onClick={capture}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-stellar/20 shadow-2xl scale-125 transition-transform hover:scale-[1.3] active:scale-[1.1] ring-4 ring-white/20"
              >
                <div className="w-12 h-12 rounded-full border-4 border-stellar flex items-center justify-center">
                   <div className="w-8 h-8 rounded-full bg-stellar" />
                </div>
              </button>
            ) : (
              <button 
                onClick={retake}
                className="px-8 py-3 bg-red-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                Retake
              </button>
            )}
          </div>
          
          {!captured && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <div className="w-72 h-96 border-4 border-dashed border-white rounded-[50%]" />
            </div>
          )}
        </div>
        
        {!captured && (
          <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-[0.2em]">Center your face in the oval</p>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-4 pt-6">
        <button 
          onClick={onPrev}
          className="flex-1 h-14 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Previous
        </button>
        <button 
          onClick={onNext}
          disabled={!captured}
          className={`flex-1 h-14 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${
            captured 
              ? 'bg-stellar text-white shadow-stellar/20 hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next Step
        </button>
      </div>
    </div>
  );
};
