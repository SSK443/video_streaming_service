import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import fs from "fs";

// this is function for uploading file to the cloud storage
export async function clouinaryUpload(localFilePath: string): Promise<UploadApiResponse | null> {
    
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME as string,
        api_key: process.env.CLOUDINARY_APIKEY as string,
        api_secret: process.env.CLOUDINARY_APISECRET as string,
    })

    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "uploads"
        })// uploading file to the cloud storage
        // console.log("file is uploaded successfully", response);get a [object,object]

        console.log(`full response from cloudinary is :${response}`)
        return response// response will be the response object from the cloudinary upload


    } catch (error) {

        if (error instanceof Error) {
            console.log(error.message);
        }
        return null;
    }
    finally {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)// in both cases of uploading file when it fails or success fully uploaded it will be deleted from the local storage to free up the memory space
        }
    }
}

