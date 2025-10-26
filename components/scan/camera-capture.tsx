'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, SwitchCamera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const videoConstraints = {
    facingMode,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="h-full w-full object-cover"
        />

        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <SwitchCamera className="h-6 w-6" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center">
          <Button
            size="lg"
            onClick={capture}
            className="h-16 w-16 rounded-full bg-white hover:bg-gray-200"
          >
            <Camera className="h-8 w-8 text-black" />
          </Button>
        </div>
      </div>
    </div>
  );
}
