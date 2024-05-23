import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    getOrders,
    getUsers,
    verifyEmail
} from "../controllers/user.controller.js"
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/verifyEmail").post(verifyEmail)


/**
 * @swagger
 * /api/v1/users/getOrdersOfSpecificUser:
 *  get:
 *      summary:Get orders of a user
 *      descripion: Retrieve a list orders of user
 *      responses:
 *          200:
 *              description: A list orders
 * 
 */
// router.route("/getOrdersOfSpecificUser").get(verifyJWT,getOrders)
router.route('/getOrdersOfSpecificUser')
  .get(verifyJWT, authorizeRoles('admin'), getOrders)
router.route("/getUserWhoPlacedOrder").get(verifyJWT,getUsers);



export default router