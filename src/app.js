import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import bodyParser from "body-parser"
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';



const app=express();
// import swagger from 'swagger-jsdoc'
// import 
// const swaggerJSDoc=require('swagger-jsdoc')
// const swaggerUi=require('swagger-ui-express')


// const bodyParser = require('body-parser');


// const options={
//     defination:{
//         openapi:'3.0.0',
//         info:{
//             titile:'Node Js Project for Mongodb',
//             version:'1.0.0'
//         },
        // servers:[
        //     {
        //         api:'http://localhost:8000/'
        //     }
        // ]
//     },
//     apis:['./']
// }

// const swaggerSpec=swaggerJSDoc(options)
const options = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Your API Documentation',
        version: '1.0.0',
        description: 'Description of your API',
      },
      servers:[
        {
            url:'http://localhost:8000'
        }
    ]
    },
    apis: ['./routes/*.js'], // Path to the API routes
  };
  
  const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec))


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
import { version } from "mongoose";

//router declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/products",productRouter)

export {app}