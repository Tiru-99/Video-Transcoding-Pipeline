import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3";
import { createWriteStream, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import path from "path";

export const downloadVideo = async (
  bucket: string,
  key: string,
  jobId: string
) => {
  const jobPath = path.join(process.cwd(), "tmp", "job", jobId);

  mkdirSync(jobPath, { recursive: true });

  const filePath = path.join(jobPath, "input.mp4");

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3.send(command);

  if (!response.Body) {
    throw new Error("No body received from S3");
  }

  const writeStream = createWriteStream(filePath);
  await pipeline(response.Body as any, writeStream);

  console.log("Download Complete:", filePath);
  return filePath;
};