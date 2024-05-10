import { Router } from "express";
import {
    buyProduct,
    getProductsSoldLastDay,
    getOrdersBetweenDates,
    searchProducts,
    searchProductsInHindi

} from "../controllers/product.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/buyProducts").post(verifyJWT,buyProduct)
router.route("/getProductsSoldLastDay").get(getProductsSoldLastDay)
router.route("/getOrdersBetweenDates").get(getOrdersBetweenDates)
router.route("/searchProducts").get(searchProducts);
router.route("/searchProductsInHindi").get(searchProductsInHindi)

export default router