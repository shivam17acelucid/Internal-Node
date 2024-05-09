import { Router } from "express";
import {
    buyProduct,
    getProductsSoldLastDay,
    getOrdersBetweenDates

} from "../controllers/product.controller.js"

const router = Router();
router.route("/buyProducts").post(buyProduct)
router.route("/getProductsSoldLastDay").get(getProductsSoldLastDay)
router.route("/getOrdersBetweenDates").get(getOrdersBetweenDates)

export default router