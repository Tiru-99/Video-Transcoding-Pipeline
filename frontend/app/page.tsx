"use client";

import { useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // safer validation
    const isMp4 =
      selected.type === "video/mp4" ||
      selected.name.toLowerCase().endsWith(".mp4");

    if (!isMp4) {
      alert("Only MP4 files allowed");
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);

      // 1️⃣ Get presigned URL
      const res = await fetch("http://localhost:5000/presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || "video/mp4",
        }),
      });

      if (!res.ok) throw new Error("Failed to get presigned URL");

      const { signedUrl } = await res.json();

      // 2️⃣ Upload to S3
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "video/mp4",
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      alert("Upload successful!");
      setFile(null);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96 text-center">
        <h1 className="text-xl font-bold mb-6">
          Upload MP4 Video
        </h1>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,video/mp4"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Custom Upload Button */}
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full mb-4 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg"
        >
          Choose MP4 File
        </button>

        {file && (
          <p className="text-sm text-gray-600 mb-4">
            Selected: {file.name}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload to S3"}
        </button>
      </div>
    </div>
  );
}