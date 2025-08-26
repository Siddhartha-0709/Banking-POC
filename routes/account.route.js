import { Router } from "express";

import { createAccount, getAccountById, updateAccount, getAccountBalance, closeAccount } from "../controllers/account.controller.js";

const router = Router();

router.route('/create-account').post(createAccount);
router.route('/get-account-by-id').get(getAccountById);
router.route('/update-account').post(updateAccount);
router.route('/get-account-balance').get(getAccountBalance);
router.route('/close-account').post(closeAccount);

export default router;


