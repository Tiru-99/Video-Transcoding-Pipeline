import { downloadVideo } from "./lib/downloadVideo"
import { runContainer } from "./lib/runContainer"

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
 const localPath = await downloadVideo( bucket , key , jobId ); 
 
 const tasks = RESOLUTIONS.map((resolution) => {
   runContainer(jobId , localPath , resolution.name , resolution.scale)
 }); 
 
 await Promise.all(tasks)
 
 console.log("All the encodings finished successfully");

 // aggregate into master m3u8 file 
 // clean the temp file 
}