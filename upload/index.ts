import express from 'express'; 
import type { Request , Response } from 'express';
import { s3 } from './s3';
import { s3_second } from './s3_second';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
const app = express(); 
import cors from "cors"; 

const PORT = 5000 ; 

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/" , ( req : Request , res : Response) => {
   res.send({
     message : "Hi from the server"
   })
})

app.post("/presigned-url" , async( req : Request , res : Response) => {
  try {
     const { fileName, fileType } = req.body;
 
     if (fileType !== "video/mp4") {
       return res.status(400).json({ error: "Only MP4 files allowed" });
     }
 
     const key = `videos/${fileName}`;
 
     const command = new PutObjectCommand({
       Bucket: process.env.AWS_BUCKET_NAME!,
       Key: key,
       ContentType: fileType,
     });
 
     const signedUrl = await getSignedUrl(s3, command, {
       expiresIn: 60, // 1 minute
     });
 
     res.json({ signedUrl, key });
 
   } catch (err) {
     console.error(err);
     res.status(500).json({ error: "Could not generate presigned URL" });
   }
 });


app.get("/videos", async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME_SECOND!,
      Prefix: "videos/",
      Delimiter: "/", // 👈 important
    });

    const response = await s3_second.send(command);
    console.log("The response is " , response ); 
    const folders = response.CommonPrefixes?.map(prefix =>
      prefix.Prefix?.replace("videos/", "").replace("/", "")
    ) || [];

    const videos = folders.map(jobId => ({
      id: jobId,
      title: jobId, 
      masterUrl: `https://${process.env.AWS_BUCKET_NAME_SECOND}.s3.${process.env.AWS_REGION}.amazonaws.com/videos/${jobId}/master.m3u8`
    }));
    
    console.log("the videos fetched from s3 are " , videos ); 

    res.json(videos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

app.listen(PORT , () => {
  console.log(`The app is listening on port ${PORT}`); 
}); 

