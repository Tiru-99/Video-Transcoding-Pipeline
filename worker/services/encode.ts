import { downloadVideo } from "./lib/downloadVideo"
import { runAdaptiveContainer } from "./lib/runContainer"
import { upload } from "../utils/upload"
import path from "path"; 


interface EncodingArgs { 
  bucket : string , 
  key : string , 
  jobId : string 
}

export const encodeVideo = async(
  encodingArgs : EncodingArgs 
) => {
 const { bucket , key , jobId}  = encodingArgs
 
 try { 
   if( !bucket || !key || !jobId){
     console.log(bucket , key , jobId ); 
     throw new Error("Some details are missing "); 
   }
   //path to downloaded video
   await downloadVideo( bucket , key , jobId ); 
   await runAdaptiveContainer(jobId , key);
  
   console.log("All the encodings finished successfully");
   const filePath = path.join(process.cwd(), "tmp" , "job" , jobId);
   //upload to s3 
   await upload( filePath , jobId); 
   console.log("Video transcoding pipeline executed"); 
 } catch(e){
   console.error("Something went wrong while video transcoding!" , e); 
 }

}

