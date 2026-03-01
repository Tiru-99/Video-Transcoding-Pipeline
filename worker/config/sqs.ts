import { SQSClient , ReceiveMessageCommand , DeleteMessageCommand} from "@aws-sdk/client-sqs";
import dotenv from "dotenv"; 
import type { S3Event } from "aws-lambda";
import { encodeVideo } from "../services/encode";

dotenv.config({
  path : "./.env"
}); 


const client = new SQSClient({
  region :process.env.AWS_REGION, 
  credentials : {
    accessKeyId : process.env.AWS_ACCESS_KEY!, 
    secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY!
  }
});


export const queueInit = async () => {
  while (true) {
    try {
      const { Messages } = await client.send(
        new ReceiveMessageCommand({
          QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
          WaitTimeSeconds: 20,
          MaxNumberOfMessages: 10,
          VisibilityTimeout: 300,
        })
      );

      if (!Messages || Messages.length === 0) {
        console.log("No message found in queue !!");
        continue;
      }

      for (const message of Messages) {
        try {
          const { MessageId, Body, ReceiptHandle } = message;

          if (!Body || !ReceiptHandle) {
            console.log("Invalid message structure");
            continue;
          }

          const event = JSON.parse(Body) as S3Event;
      
          // ignore test event
          if ("Service" in event && "Event" in event) {
            if (event.Event === "s3:TestEvent") {
              console.log("Ignoring test event");
              await deleteMessage(client , ReceiptHandle); 
              continue;
            }
          }

          console.log("Processing message:", MessageId);

          const encodingProps = { 
            ...getBucketMetadata(event) ,
            jobId : message.MessageId as string
          }
          
          await encodeVideo(encodingProps);  
          // delete message after success 
          await deleteMessage(client , ReceiptHandle); 
          console.log("Message deleted successfully");

        } catch (err) {
          console.error("Error processing single message:", err);
        }
      }

    } catch (err) {
      console.error("Error receiving messages from SQS:", err);
      // prevent tight crash loop
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}; 

const getBucketMetadata = (event: S3Event) => {
  const record = event.Records[0];
  if (!record) {
    throw new Error("No record found in s3");
  }
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(
    record.s3.object.key.replace(/\+/g, " ")
  );
  return { bucket, key };
};

const deleteMessage = async( client : SQSClient , ReceiptHandle : string) => {
  await client.send(
    new DeleteMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
      ReceiptHandle,
    })
  );
}
  
