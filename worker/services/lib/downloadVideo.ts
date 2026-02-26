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
  console.log("Coming into download part and the key here is", key);

  const jobPath = path.join(process.cwd(), "tmp", "job", jobId);
  mkdirSync(jobPath, { recursive: true });

  // extract filename
  const fileName = path.basename(key);
  const filePath = path.join(jobPath, fileName);

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