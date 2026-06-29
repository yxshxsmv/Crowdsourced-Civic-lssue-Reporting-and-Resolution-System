"use client";

import { useState, useRef, useCallback } from "react";

export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActive(true);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to access camera");
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setActive(false);
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          setPhoto({ blob, url });
          stop();
          resolve({ blob, url });
        },
        "image/jpeg",
        0.85
      );
    });
  }, [stop]);

  const reset = useCallback(() => {
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto(null);
  }, [photo]);

  return { videoRef, photo, error, active, start, stop, capture, reset };
}
