import dotenv from "dotenv"
import {db_connect} from "./db/db_connect.ts"
import { app } from "./app.ts";


dotenv.config({
    path:"./.env"
})

const port=process.env.PORT||3000;

db_connect()
.then(()=>{
       app.on("error",(error:unknown)=>{
        console.log(`error occured in app ${error}`)
    })
    app.listen(port,()=>{
        console.log(`app running on http://localhost:${port}`)

    })

 

})
.catch((error:unknown)=>{
    console.log(`error in db_connect:${error}`)

})


