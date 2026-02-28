import fs from "fs"; 
import { readdir } from "fs/promises";
import { uploadToS3 } from "../config/s3";

const isDirectory = async(dirPath : string ) => {
  try {
    const stats = fs.lstatSync(dirPath); 
    return stats.isDirectory();   
  } catch(e){
    console.error("Something went wrong while checking status of file" , e); 
  }
}

// batch uploads 
const batchUpload = async(fileNames : string[] , dirName : string , file : string , jobId : string ) => {
  const BATCH_SIZE = 5; 
  for(let i = 0 ; i < fileNames.length ; i+=BATCH_SIZE){
    const slicedArr = fileNames.slice( i , i + BATCH_SIZE); 
    const fileUploadPromises = slicedArr.map((singleFile) => {
      const filePath =`${dirName}/${file}/${singleFile}`; 
      console.log("the file path is " , filePath); 
      const key = `videos/${jobId}/${file}/${singleFile}`; 
      return uploadToS3(filePath , key); 
    }); 
    await Promise.all(fileUploadPromises);
   //add a retry mechanism here as well  
  }
}


export const upload = async(dirName : string , jobId : string) => {
  console.log("Coming to the upload part");
  try { 
    const fileNames = await readdir(dirName); 
  
    for(const file of fileNames){
      const isDir = await isDirectory(`${dirName}/${file}`);
      if(isDir === true){
        const filesInDir = await readdir(`${dirName}/${file}`);
        await batchUpload(filesInDir , dirName , file , jobId);
  
      } else {
        const filePath = `${dirName}/${file}`; 
        const key = `videos/${jobId}/${file}`; 
        await uploadToS3(filePath , key); 
      }
    }

  } catch(e){
    console.error("Something went wrong while uploading files" , e);
  }

}

 
