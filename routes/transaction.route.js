import Router from 'express';
import { deposit, withdraw, transfer, getTransactionHistory } from '../controllers/transaction.controller.js';


const router = Router();

router.route('/deposit').post(deposit);
router.route('/withdraw').post(withdraw);
router.route('/transfer').post(transfer);
router.route('/transaction-history').get(getTransactionHistory);

export default router;

