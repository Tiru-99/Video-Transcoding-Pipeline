import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";

export function runContainer(
  jobId: string,
  inputPath: string,
  resolution: string,
  scale: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // const jobPath = path.join("/tmp/jobs", jobId);
    const jobPath = path.join(process.cwd() , "tmp" , "job" , jobId); 
    console.log("The job path is " , jobPath); 
    if (!existsSync(jobPath)) {
      return reject(new Error(`Job path does not exist: ${jobPath}`));
    }

    const inputFileName = "input.mp4";

    const dockerArgs = [
      "run",
      "--rm",
      "-v",
      `${jobPath}:/data`,
      "my-ffmpeg-image",
      "-y", 
      "-i",
      `/data/${inputFileName}`,
      "-vf",
      `scale=${scale}`,
      `/data/output_${resolution}.mp4`,
    ];

    console.log(`Starting ${resolution} container...`);

    const docker = spawn("docker", dockerArgs);

    docker.stdout.on("data", (data) => {
      console.log(`[${resolution}] ${data.toString()}`);
    });

    docker.stderr.on("data", (data) => {
      console.log(`[${resolution}] ${data.toString()}`);
    });

    docker.on("error", (err) => {
      reject(new Error(`Docker failed to start: ${err.message}`));
    });

    docker.on("close", (code) => {
      if (code === 0) {
        console.log(`${resolution} transcoding complete`);
        resolve();
      } else {
        reject(new Error(`${resolution} failed with exit code ${code}`));
      }
    });
  });
}