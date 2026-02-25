import { queueInit } from "./config/sqs";

queueInit(); 

/*
  Need a docker service to encode videos parallely and properly 
  in 4 formats , solid retry mechanism and an aggregator logic 
  to merge 
*/