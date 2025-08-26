import { Router } from "express";
import { createCustomer, getCustomerAccounts, getCustomerById, updateCustomer } from "../controllers/customer.controller.js";

const router = Router();

router.route('/create-customer').post(createCustomer);
router.route('/get-customer-by-id').get(getCustomerById);
router.route('/update-customer').post(updateCustomer);
router.route('/get-customer-accounts').get(getCustomerAccounts);


export default router;