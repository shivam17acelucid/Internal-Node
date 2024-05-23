import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import mongoose from "mongoose";
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//console.log(process.env.SENDGRID_API_KEY)
const emailRegxp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const getAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        return accessToken
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Something went wrong while generating access token ")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password,role } = req.body

    if (!username) {
        throw new ApiError(400, "Username is required")
    }
    if (!email) {
        throw new ApiError(400, "email is required")
    }
    if (!emailRegxp.test(email)) {
        throw new ApiError(400, "invalid email");
    }
    if (!password) {
        throw new ApiError(400, "Password is required")
    }
    if (!['admin', 'vendor', 'wholesaler'].includes(role)) {
        return res.status(400).send('Invalid role');
      }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]

    })

    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }

    const user = await User.create({
        username,
        password,
        email,
        role
    })

    const createdUser = await User.findById(user._id).select("-password")
    if (!createdUser) {
        throw new ApiError(500, "something went wrong")
    }
    const token = await getAccessToken(user._id);
    user.accessToken = token;

    user.save();

    const msg = {
        to: email,
        from: 'shivam.rawat@acelucid.com',
        subject: 'Test Email',
        text: 'This is a test email sent using SendGrid.',
        html: `<h1>Email Confirmation</h1>
          <h2>Hello ${username}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:8000/api/v1/users/verifyEmail/${token}> Click here</a>
          </div>`,
    };

    sgMail
        .send(msg)
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.error(error);
        });


    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "user registered successfully"))
})

const verifyEmail = asyncHandler(async (req, res) => {
    let { accessToken } = req.query;

    const user = await User.findOne({ accessToken }).select("-password");

    if (!user) {
        // If user with the provided token is not found, return an error
        return res.status(404).json({ message: 'User not found' });
    }

    // If user is found, return success message
    return res.status(200).json(new ApiResponse(200, { user }, "user registered successfully"));
})


const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body
    if (!username) {
        throw new ApiError(400, "username  is required")
    }
    const user = await User.findOne({ username })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials")
    }

    const token = await getAccessToken(user._id);
    user.accessToken = token;
    user.save();

    const loggedInUser = await User.findById(user._id).
        select("-password")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("accessToken", token, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser
                },
                "User logged in Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out."))
})

const getOrders = asyncHandler(async (req, res) => {

    const { userId } = req.query;
    console.log(userId)
    const last24Hours = new Date();
    last24Hours.setDate(last24Hours.getDate() - 1);

    const orders = await Order.find({
        userId,
        createdAt: { $gte: last24Hours }
    }).select("-userId");

    return res.json({ orders });
})



function parseDateString(dateString) {
    const [day, month, year] = dateString.split('/');
    const hour = 0
    const minute = 0
    const dateObj = new Date(year, month - 1, day, hour, minute); // Month is zero-based
    const desiredFormat = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}T${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}.000+00:00`;
    console.log(desiredFormat);
    return desiredFormat;
}

const getUsers = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;

    const start = parseDateString(startDate);
    const end = parseDateString(endDate);

    let orders = await Order.find({
        createdAt: { $gte: start, $lte: end }
    }).populate('userId');


    const userIds = orders.map((order )=> {
        //console.log(order);
        order.userId?._id
});

    // Fetch users associated with the orders
    const users = await User.find({ _id: { $in: userIds } }).select("-password -orders");
    const ordersPlaced = await Order.find({ createdAt: { $gte: start, $lte: end } }).select("-userId")
    users.forEach(user => {
        user.orders = [];
    });

    users.forEach(user => {
        const userOrders = orders.filter(order => order.userId.equals(user._id));
        user.orders.push(...userOrders.map(order => ({
             _id: order._id,
            // items:order.items,
            // description: order.description,
            // price: order.price,
        })));
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { users, ordersPlaced }, "user and orders successfully returned."))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    getOrders,
    getUsers,
    verifyEmail
}