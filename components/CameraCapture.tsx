import React, { useRef, useState } from "react";

export default function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const streamRef = useRef(null);

  // Start camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      alert("Error accessing camera: " + err.message);
    }
  };

  // Capture image
  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setPhoto(dataUrl);

    // Stop camera after capture
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setShowCamera(false);
  };

  // Upload photo
  const uploadPhoto = async () => {
    if (!photo) return;

    const blob = await (await fetch(photo)).blob();
    const formData = new FormData();
    formData.append("file", blob, "capture.png");

    try {
      const res = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.text();
      alert("Upload successful: " + result);
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      {!showCamera && !photo && (
        <button onClick={openCamera}>Open Camera</button>
      )}

      {showCamera && (
        <div style={{ position: "relative" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", maxWidth: "400px" }}
          />
          <br />
          <button onClick={capturePhoto}>Capture</button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {photo && (
        <div>
          <img
            src={photo}
            alt="Captured"
            style={{ width: "100%", maxWidth: "400px", marginTop: "10px" }}
          />
          <br />
          <button onClick={uploadPhoto}>Upload</button>
        </div>
      )}
    </div>
  );
}
