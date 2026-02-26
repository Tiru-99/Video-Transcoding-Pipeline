import { downloadVideo } from "./lib/downloadVideo"
import { runAdaptiveContainer } from "./lib/runContainer"

interface EncodingArgs { 
  bucket : string , 
  key : string , 
  jobId : string 
}

const RESOLUTIONS = [
  { name: "480p", scale: "854:480" },
  { name: "720p", scale: "1280:720" },
  { name: "1080p", scale: "1920:1080" },
];

export const encodeVideo = async(
  encodingArgs : EncodingArgs 
) => {
 const { bucket , key , jobId}  = encodingArgs
 //path to downloaded video
 await downloadVideo( bucket , key , jobId ); 
 await runAdaptiveContainer(jobId , key);

 console.log("All the encodings finished successfully");
 // upload to s3 
 // clean the temp file 
}