import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        orders: [
            {
                type: Schema.Types.ObjectId,
                ref: "Order"
            }
        ],
        accessToken: {
            type: String,
        },
        contactInformation: {
            type: String,
            trim: true,
            index: true
        },
        role: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)

