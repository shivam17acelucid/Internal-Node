import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { translate } from "bing-translate-api";




const buyProduct = asyncHandler(async (req, res) => {

    const { userId, items } = req.body;
    let totalPrice = 0;
    const order = new Order({
        userId,
        description: `Order for product`,
        items: [] // Add the product as an item in the order

    });
    for (const item of items) {
        const { productId, quantity } = item;

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: `Product with ID ${productId} not found` });
        }

        // Add the item to the order
        // order.price+=product.price*quantity;

        totalPrice += product.price * quantity;
        order.items.push({ productId, quantity });
    }

    // Save the order to the database
    order.price = totalPrice;
    const order1 = await order.save();
    // console.log(order1._id);

    await User.findByIdAndUpdate(
        userId,
        { $push: { orders: order1._id } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order successfully"))
})

const getProductsSoldLastDay = asyncHandler(async (req, res) => {

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const orders = await Order.find({ createdAt: { $gte: last24Hours } });
    const productIds = orders.flatMap(order => order.items.map(item => item.productId));
    const products = await Product.find({ _id: { $in: productIds } });
    const userIds = orders.map(order => order.userId);
    const users = await User.find({ _id: { $in: userIds } });
    return res.status(200).json({ products, users });

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
const getOrdersBetweenDates = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;
    // Parse date strings into JavaScript Date objects
    const startDateObject = parseDateString(startDate);
    const endDateObject = parseDateString(endDate);
    //console.log('Start Date:', startDateObject);
    //console.log('End Date:', endDateObject);

    // Find orders within the specified date range and populate user details
    const orders = await Order.find({ createdAt: { $gte: `${startDateObject}`, $lte: endDateObject } });
    //const userIds = orders.map(order => order.userId);

    const ordersByUser = orders.reduce((acc, order) => {
        if (!acc[order.userId]) {
            acc[order.userId] = [];
        }
        acc[order.userId].push(order);
        return acc;
    }, {});

    // Fetch user details for each user ID
    const usersWithOrders = [];
    for (const userId of Object.keys(ordersByUser)) {
        const user = await User.findById(userId);
        if (user) {
            usersWithOrders.push({ user, orders: ordersByUser[userId] });
        }
    }

    return res.status(200).json({ orders });

})


const searchProducts = asyncHandler(async (req, res) => {
    const { word, language } = req.query;
    console.log(language);

    // Query the database for products containing the word as a substring
    const products = await Product.find({ productName: { $regex: new RegExp(word, 'i') } });

    const translatedProducts = await Promise.all(
        products.map(async (product) => {
            try {
                //  console.log("product",product?.name);
                console.log(product);
                const translation = await translate(product.productName, null, language);
                console.log(translation.translation);
                if (translation) {
                    return { ...product._doc, productName: translation.translation };
                } else {
                    console.error(`Error translating product name: ${product.productName}`);
                    return product;
                }
            } catch (error) {
                console.error(`Error translating product name: ${product.productName}`, error);
                return product;
            }
        })
    );
    res.json({ products: translatedProducts });
});
const searchProductsInHindi = asyncHandler(async (req, res) => {
    const { word } = req.query
    const translation = await translate(word, null, "en");

    const productName = translation.translation;
    const products = await Product.find({ productName });
    return res.status(200).json(new ApiResponse(products, "success"));
})

export {
    getProductsSoldLastDay,
    buyProduct,
    getOrdersBetweenDates,
    searchProducts,
    searchProductsInHindi
}