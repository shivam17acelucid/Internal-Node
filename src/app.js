import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import bodyParser from "body-parser"

// const bodyParser = require('body-parser');

const app=express();
app.use(bodyParser.json());
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({
    limit:"16kb"
}))
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
app.use(cookieParser())
// app.use(express.static("public"))

import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"

//router declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/products",productRouter)

export {app}