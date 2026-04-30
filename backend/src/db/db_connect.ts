import mongoose from "mongoose";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { db_name } from "../constants.ts";

export const db_connect = async (): Promise<void> => {
  try {
    const key = process.env.APP_DB;
    if (!key) {
      throw new Error("DB URI MISSING IN .env FILE");
    }
    const connection_instance = await mongoose.connect(`${key}/${db_name}`);

    console.log(
      `MONGODB CONNECTION SUCCESSFULLY:${connection_instance.connection.host}`
    );
  } catch (error: unknown) {
   if(error instanceof Error){
    console.error(` MongoDB connection failed: ${error.message}`);
   }else{
    console.error("unknown error occured")
   }

    process.exit(1);
  }
};
