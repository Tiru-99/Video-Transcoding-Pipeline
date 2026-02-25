import express from 'express'; 
import type { Request , Response } from 'express';
const app = express(); 

const PORT = 5000 ; 

app.get("/" , ( req : Request , res : Response) => {
   res.send({
     message : "Hi from the server"
   })
})

app.post("/upload" , ( req : Request , res : Response) => {
  
})

app.listen(PORT , () => {
  console.log(`The app is listening on port ${PORT}`); 
}); 

