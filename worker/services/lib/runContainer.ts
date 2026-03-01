import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";

export function runAdaptiveContainer(
  jobId: string,
  key: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const jobPath = path.join(process.cwd(), "tmp", "job", jobId);

    if (!existsSync(jobPath)) {
      return reject(new Error(`Job path does not exist: ${jobPath}`));
    }

    const inputFileName = path.basename(key);

    console.log("Starting adaptive HLS encoding...");

    const dockerArgs = [
      "run",
      "--rm",
      "-v",
      `${jobPath}:/data`,
      "my-ffmpeg-image",

      // Better logs
      "-hide_banner",
      "-loglevel", "info",
      "-stats",

      "-y",
      "-i", `/data/${inputFileName}`,

      // Split into 4 video streams
      "-filter_complex",
      "[0:v]split=4[v1][v2][v3][v4];" +
      "[v1]scale=256:144:flags=lanczos[v144];" +
      "[v2]scale=854:480:flags=lanczos[v480];" +
      "[v3]scale=1280:720:flags=lanczos[v720];" +
      "[v4]scale=1920:1080:flags=lanczos[v1080]",

      // 144p
      "-map", "[v144]",
      "-map", "0:a?",

      // 480p
      "-map", "[v480]",
      "-map", "0:a?",

      // 720p
      "-map", "[v720]",
      "-map", "0:a?",

      // 1080p
      "-map", "[v1080]",
      "-map", "0:a?",

      // Video encoding
      "-c:v", "libx264",
      "-preset", "fast",
      "-profile:v", "main",
      "-level", "4.0",
      "-pix_fmt", "yuv420p",
      "-crf", "23",
      "-g", "48",
      "-keyint_min", "48",
      "-sc_threshold", "0",

      // Bitrate ladder
      "-b:v:0", "200k",
      "-maxrate:v:0", "214k",
      "-bufsize:v:0", "300k",

      "-b:v:1", "800k",
      "-maxrate:v:1", "856k",
      "-bufsize:v:1", "1200k",

      "-b:v:2", "1400k",
      "-maxrate:v:2", "1498k",
      "-bufsize:v:2", "2100k",

      "-b:v:3", "2800k",
      "-maxrate:v:3", "2996k",
      "-bufsize:v:3", "4200k",

      // Audio
      "-c:a", "aac",
      "-b:a", "128k",
      "-ac", "2",

      // HLS
      "-f", "hls",
      "-hls_time", "4",
      "-hls_playlist_type", "vod",
      "-hls_flags", "independent_segments",
      "-hls_segment_type", "mpegts",

      "-master_pl_name", "master.m3u8",

      "-var_stream_map",
      "v:0,a:0,name:144p v:1,a:1,name:480p v:2,a:2,name:720p v:3,a:3,name:1080p",

      "/data/%v/index.m3u8"
    ];

    const docker = spawn("docker", dockerArgs, {
      stdio: ["ignore", "pipe", "pipe"]
    });

    // FFmpeg progress comes in stderr
    docker.stderr.on("data", (data) => {
      const output = data.toString();
      process.stdout.write(output);
    });

    docker.stdout.on("data", (data) => {
      process.stdout.write(data.toString());
    });

    docker.on("error", (err) => {
      console.error("Docker spawn error:", err);
      reject(new Error(`Docker failed: ${err.message}`));
    });

    docker.on("close", (code) => {
      if (code === 0) {
        console.log("Adaptive HLS encoding complete.");
        resolve();
      } else {
        reject(new Error(`Encoding failed with exit code ${code}`));
      }
    });
  });
}