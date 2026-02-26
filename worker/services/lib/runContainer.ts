import { spawn } from "child_process";
import path from "path";
import { existsSync, mkdirSync } from "fs";

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

    const dockerArgs = [
      "run",
      "--rm",
      "-v",
      `${jobPath}:/data`,
      "my-ffmpeg-image",

      "-y",
      "-i", `/data/${inputFileName}`,

      // Split into 3 streams
      "-filter_complex",
      "[0:v]split=3[v1][v2][v3];" +
      "[v1]scale=854:480[v480];" +
      "[v2]scale=1280:720[v720];" +
      "[v3]scale=1920:1080[v1080]",

      // Map outputs
      "-map", "[v480]",
      "-map", "[v720]",
      "-map", "[v1080]",

      // Encoding settings
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-g", "48",
      "-sc_threshold", "0",

      // Bitrate ladder
      "-b:v:0", "800k",
      "-b:v:1", "1400k",
      "-b:v:2", "2800k",

      // HLS Settings
      "-f", "hls",
      "-hls_time", "4",
      "-hls_playlist_type", "vod",
      "-hls_flags", "independent_segments",

      "-master_pl_name", "master.m3u8",

      "-var_stream_map",
      "v:0,name:480p v:1,name:720p v:2,name:1080p",

      "/data/%v/index.m3u8"
    ];

    console.log("Starting adaptive HLS encoding...");

    const docker = spawn("docker", dockerArgs);

    docker.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    docker.stderr.on("data", (data) => {
      console.log(data.toString());
    });

    docker.on("error", (err) => {
      reject(new Error(`Docker failed: ${err.message}`));
    });

    docker.on("close", (code) => {
      if (code === 0) {
        console.log("Adaptive HLS encoding complete");
        resolve();
      } else {
        reject(new Error(`Encoding failed with code ${code}`));
      }
    });
  });
}