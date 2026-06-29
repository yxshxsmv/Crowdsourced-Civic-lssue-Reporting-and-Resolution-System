"use client";

import { Camera, Upload, RotateCcw } from "lucide-react";
import useCamera from "@/hooks/useCamera";

export default function GeoCamera({ onCapture, onFileSelect }) {
  const { videoRef, photo, error, active, start, capture, reset } = useCamera();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onFileSelect?.({ blob: file, url });
    }
  };

  if (photo) {
    return (
      <div className="space-y-3">
        <img src={photo.url} alt="Captured" className="w-full rounded-lg border" />
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            Retake
          </button>
          <button
            onClick={() => onCapture?.(photo)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Use Photo
          </button>
        </div>
      </div>
    );
  }

  if (active) {
    return (
      <div className="space-y-3">
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border bg-black" />
        <button
          onClick={capture}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Camera className="h-5 w-5" />
          Capture Photo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={start}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Camera className="h-5 w-5" />
          Open Camera
        </button>
        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-gray-50">
          <Upload className="h-5 w-5" />
          Upload Photo
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      <p className="text-xs text-gray-500">GPS coordinates will be automatically captured with your photo.</p>
    </div>
  );
}
