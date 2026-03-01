"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Player from "video.js/dist/types/player";

// Import quality selector plugins
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";

interface Props {
  src: string;
}

export default function VideoPlayer({ src }: Props) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        width: 800,
        height: 450,
        sources: [
          {
            src,
            type: "application/x-mpegURL",
          },
        ],
      }));

      // Initialize quality selector plugin
      // @ts-ignore
      player.hlsQualitySelector({
        displayCurrentQuality: true,
      });

      player.on("error", () => {
        const error = player.error();
        console.error("VideoJS Error:", error);
      });
    } else if (playerRef.current) {
      // If player already exists, just update the source
      const player = playerRef.current;
      player.src({ src, type: "application/x-mpegURL" });
    }
  }, [src]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="mt-8 flex justify-center w-full max-w-4xl mx-auto">
      <div data-vjs-player ref={videoRef} className="w-full" />
    </div>
  );
}