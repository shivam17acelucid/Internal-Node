import mongoose, { Schema } from "mongoose";
const invoiceSchema=new mongoose.model(
    {
        orderId:{
            type:Schema.Types.ObjectId,
            ref:"Order"
        },
        amount:{
            type:Number,
        },
        paymentMethod:{
            type:String,
            enum:["Online","Cash","Cheque"]
        },
        status:{
            type:String,
            enum:["Pending","Completed"]
        }
    },
    {
        timestamps:true
    }
)

export const Invoice=mongoose.model("Invoice",invoiceSchema);