"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface VisitorPhotoCaptureProps {
  value?: string;
  existingPhotoUrl?: string | null;
  onChange: (dataUrl: string | undefined) => void;
}

export function VisitorPhotoCapture({
  value,
  existingPhotoUrl,
  onChange,
}: VisitorPhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const preview = value || existingPhotoUrl || null;

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  // Attach stream after <video> is mounted (first open used to miss this).
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!isCameraOpen || !video || !stream) {
      return;
    }

    video.srcObject = stream;
    void video.play().catch(() => {
      toast.error("Could not start the camera preview.");
    });

    return () => {
      video.srcObject = null;
    };
  }, [isCameraOpen]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOpen(false);
  }

  async function startCamera() {
    try {
      setIsStarting(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Camera is not supported in this browser.");
        return;
      }

      // Release any previous stream before requesting a new one.
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      toast.error("Unable to access the camera. Check browser permissions.");
      stopCamera();
    } finally {
      setIsStarting(false);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (!width || !height) {
      toast.error("Camera is still starting. Wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      toast.error("Could not capture photo.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    const maxWidth = 480;
    const scale = Math.min(1, maxWidth / width);
    const output = document.createElement("canvas");
    output.width = Math.round(width * scale);
    output.height = Math.round(height * scale);
    const outputContext = output.getContext("2d");

    if (!outputContext) {
      toast.error("Could not capture photo.");
      return;
    }

    outputContext.drawImage(canvas, 0, 0, output.width, output.height);
    const dataUrl = output.toDataURL("image/jpeg", 0.72);
    onChange(dataUrl);
    stopCamera();
  }

  function clearPhoto() {
    onChange(undefined);
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <Label>Visitor Photo</Label>
      <div className="grid gap-4 rounded-lg border border-border/70 p-4 md:grid-cols-[220px_1fr]">
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-muted">
          <video
            ref={videoRef}
            className={
              isCameraOpen
                ? "h-full w-full object-cover"
                : "pointer-events-none absolute inset-0 h-full w-full opacity-0"
            }
            playsInline
            muted
            autoPlay
          />

          {!isCameraOpen && preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Visitor preview"
              className="h-full w-full object-cover"
            />
          ) : null}

          {!isCameraOpen && !preview ? (
            <div className="flex flex-col items-center gap-2 p-4 text-center text-sm text-muted-foreground">
              <Camera className="size-8" />
              No photo yet
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-center gap-2">
          <p className="text-sm text-muted-foreground">
            Capture a clear face photo for the visitor badge. Optional, but
            recommended.
          </p>
          <div className="flex flex-wrap gap-2">
            {!isCameraOpen ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void startCamera()}
                disabled={isStarting}
              >
                <Camera className="size-4" />
                {isStarting
                  ? "Opening..."
                  : preview
                    ? "Retake Photo"
                    : "Open Webcam"}
              </Button>
            ) : (
              <>
                <Button type="button" onClick={capturePhoto}>
                  Capture
                </Button>
                <Button type="button" variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </>
            )}
            {preview && !isCameraOpen ? (
              <Button type="button" variant="outline" onClick={clearPhoto}>
                <Trash2 className="size-4" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
