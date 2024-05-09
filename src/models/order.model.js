import mongoose, { Schema } from "mongoose";
const orderSchema=new mongoose.Schema(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
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

export const Order =mongoose.model("Order",orderSchema)