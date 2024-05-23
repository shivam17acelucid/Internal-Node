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


/**
 * @swagger
 * /api/v1/products/buyProducts:
 *   post:
 *     summary: API for buying product
 *     description: Endpoint for purchasing products
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Product information
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             class:
 *               type: string
 *     responses:
 *       200:
 *         description: Successfully created a new sample.
 */


router.route("/buyProducts").post(verifyJWT,buyProduct)
router.route("/getProductsSoldLastDay").get(getProductsSoldLastDay)
router.route("/getOrdersBetweenDates").get(getOrdersBetweenDates)
router.route("/searchProducts").get(searchProducts);
router.route("/searchProductsInHindi").get(searchProductsInHindi)
export default router