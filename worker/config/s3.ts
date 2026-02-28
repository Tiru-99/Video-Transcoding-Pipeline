import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

export const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


//recursively insert into bucket 
export const uploadToS3 = async (filePath: string , key : string  ) => {
  const fileStream = await fs.promises.readFile(filePath);
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: fileStream,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    const data = await s3.send(command);
    console.log("Success, object uploaded. ETag:", data.ETag);
    return data;
  } catch (e) {
    console.log("Something went wrong while uploading to S3 ", e);
  }
};
