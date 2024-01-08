
const express = require("express");
const app = express();
const env = require("dotenv")
const dbConnection = require("./config/mongoose");
const adminRouter = require("./router/adminRouter")
const userRouter = require("./router/userRouter")
const cors = require("cors")
let logger = require("morgan")
let fileUpload = require("express-fileupload");
  
require("../.env");

env.config({ path: "./.env" })
 

dbConnection()

 

app.use(logger("combined"))
app.use(cors({  
    origin: [
        "https://admin.veguess.shop",
        "http://veguess.shop",
        "www.admin.veguess.shop",
        "www.veguess.shop"
    ],
}))

app.use(fileUpload())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

let port = process.env.BACK_END_PORT || 3000;
console.log(process.env.MONGO_URI)

app.use("/", userRouter);
app.use("/admin", adminRouter)


app.listen(3000, () => {
    console.log("Server started at port 7000")
})
