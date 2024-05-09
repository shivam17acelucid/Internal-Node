import { Router } from "express";
import {
    buyProduct,
    getProductsSoldLastDay,
    getOrdersBetweenDates

} from "../controllers/product.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/buyProducts").post(verifyJWT,buyProduct)
router.route("/getProductsSoldLastDay").get(getProductsSoldLastDay)
router.route("/getOrdersBetweenDates").get(getOrdersBetweenDates)

export default router