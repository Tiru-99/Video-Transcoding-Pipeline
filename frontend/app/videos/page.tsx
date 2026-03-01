"use client";

import { useEffect, useState } from "react";
import VideoPlayer from "@/components/Video";

interface Video {
  id: string;
  title: string;
  masterUrl: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selected, setSelected] = useState<Video | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/videos")
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-8">Video Library</h1>

      <div className="grid grid-cols-3 gap-6">
        {videos.map(video => (
          <div
            key={video.id}
            onClick={() => setSelected(video)}
            className="cursor-pointer bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg">{video.title}</h2>
            <p className="text-gray-500 text-sm">Click to play</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-12 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Now Playing: {selected.title}
          </h2>
          <VideoPlayer src={selected.masterUrl} />
        </div>
      )}
    </div>
  );
}