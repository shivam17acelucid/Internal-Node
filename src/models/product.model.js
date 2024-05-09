import mongoose from "mongoose";
const productSchema=new mongoose.Schema(
    {
        productName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        // productId:{
        //     type:String,
        //     required:true    
        // },
        description:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        price:{
            type:Number,
            required:true,
        }
    },
    {
        timestamps:true
    }
)

export const Product =mongoose.model("Product",productSchema)