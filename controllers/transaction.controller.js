import oracledb from "oracledb";
import db from "../database/db.connection.js";

/**
 * Deposit money into an account
 */
const deposit = async (req, res) => {
  let connection;
  try {
    const { account_id, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid deposit amount" });
    }

    connection = await db.getConnection();

    // Update balance
    await connection.execute(
      `UPDATE xxkpmg_accounts_tbl_bnk
         SET balance = balance + :amount,
             updated_at = SYSTIMESTAMP
       WHERE account_id = :account_id`,
      { amount, account_id },
      { autoCommit: false }
    );

    // Record transaction using sequence
    const result = await connection.execute(
      `INSERT INTO xxkpmg_transactions_tbl_bnk 
         (transaction_id, account_id, transaction_type, amount, status)
       VALUES (xxkpmg_transactions_seq.NEXTVAL, :account_id, 'DEPOSIT', :amount, 'SUCCESS')
       RETURNING transaction_id INTO :txn_id`,
      { account_id, amount, txn_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
      { autoCommit: false }
    );

    await connection.commit();

    res.json({ 
      message: "Deposit successful", 
      transaction_id: result.outBinds.txn_id[0],
      account_id, 
      amount 
    });
  } catch (err) {
    console.error("Error in deposit:", err);
    if (connection) await connection.rollback();
    res.status(500).json({ error: "Deposit failed" });
  } finally {
    if (connection) await connection.close();
  }
};


/**
 * Withdraw money from an account
 */
const withdraw = async (req, res) => {
  let connection;
  try {
    const { account_id, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid withdraw amount" });
    }

    connection = await db.getConnection();

    // Check balance
    const result = await connection.execute(
      `SELECT balance FROM xxkpmg_accounts_tbl_bnk WHERE account_id = :account_id`,
      [account_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (result.rows[0].BALANCE < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Update balance
    await connection.execute(
      `UPDATE xxkpmg_accounts_tbl_bnk
         SET balance = balance - :amount,
             updated_at = SYSTIMESTAMP
       WHERE account_id = :account_id`,
      { amount, account_id },
      { autoCommit: false }
    );

    // Record transaction
    const txnResult = await connection.execute(
      `INSERT INTO xxkpmg_transactions_tbl_bnk 
         (transaction_id, account_id, transaction_type, amount, status)
       VALUES (xxkpmg_transactions_seq.NEXTVAL, :account_id, 'WITHDRAW', :amount, 'SUCCESS')
       RETURNING transaction_id INTO :txn_id`,
      { account_id, amount, txn_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
      { autoCommit: false }
    );

    await connection.commit();

    res.json({ 
      message: "Withdrawal successful", 
      transaction_id: txnResult.outBinds.txn_id[0],
      account_id, 
      amount 
    });
  } catch (err) {
    console.error("Error in withdrawal:", err);
    if (connection) await connection.rollback();
    res.status(500).json({ error: "Withdrawal failed" });
  } finally {
    if (connection) await connection.close();
  }
};


/**
 * Transfer money between accounts
 */
const transfer = async (req, res) => {
  let connection;
  try {
    console.log("Transfer request body:", req.body);
    
    const { from_account_id, to_account_id, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer amount" });
    }

    if (from_account_id === to_account_id) {
      return res.status(400).json({ error: "Cannot transfer to the same account" });
    }

    connection = await db.getConnection();

    // Check sender balance
    const result = await connection.execute(
      `SELECT balance FROM xxkpmg_accounts_tbl_bnk WHERE account_id = :id`,
      [from_account_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0 || result.rows[0].BALANCE < amount) {
      return res.status(400).json({ error: "Insufficient funds or invalid source account" });
    }

    // Debit sender
    await connection.execute(
      `UPDATE xxkpmg_accounts_tbl_bnk
         SET balance = balance - :amount, updated_at = SYSTIMESTAMP
       WHERE account_id = :id`,
      { amount, id: from_account_id },
      { autoCommit: false }
    );

    // Credit receiver
    await connection.execute(
      `UPDATE xxkpmg_accounts_tbl_bnk
         SET balance = balance + :amount, updated_at = SYSTIMESTAMP
       WHERE account_id = :id`,
      { amount, id: to_account_id },
      { autoCommit: false }
    );

    // Record transfer out
    await connection.execute(
      `INSERT INTO xxkpmg_transactions_tbl_bnk 
         (transaction_id, account_id, transaction_type, amount, related_account, status)
       VALUES (xxkpmg_transactions_seq.NEXTVAL, :from_id, 'TRANSFER_OUT', :amount, :to_id, 'SUCCESS')`,
      { from_id: from_account_id, amount, to_id: to_account_id },
      { autoCommit: false }
    );

    // Record transfer in
    const txnResult = await connection.execute(
      `INSERT INTO xxkpmg_transactions_tbl_bnk 
         (transaction_id, account_id, transaction_type, amount, related_account, status)
       VALUES (xxkpmg_transactions_seq.NEXTVAL, :to_id, 'TRANSFER_IN', :amount, :from_id, 'SUCCESS')
       RETURNING transaction_id INTO :txn_id`,
      { to_id: to_account_id, amount, from_id: from_account_id, txn_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
      { autoCommit: false }
    );

    await connection.commit();

    res.json({
      message: "Transfer successful",
      transaction_id: txnResult.outBinds.txn_id[0],
      from_account_id,
      to_account_id,
      amount,
    });
  } catch (err) {
    console.error("Error in transfer:", err);
    if (connection) await connection.rollback();
    res.status(500).json({ error: "Transfer failed" });
  } finally {
    if (connection) await connection.close();
  }
};


/**
 * Get transaction history by account
 */
const getTransactionHistory = async (req, res) => {
  let connection;
  try {
    const { account_id } = req.query;
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT transaction_id, account_id, transaction_type, amount, description, created_at, related_account, status
         FROM xxkpmg_transactions_tbl_bnk 
        WHERE account_id = :account_id
        ORDER BY created_at DESC`,
      [account_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching transaction history:", err);
    res.status(500).json({ error: "Failed to fetch transaction history" });
  } finally {
    if (connection) await connection.close();
  }
};

export { deposit, withdraw, transfer, getTransactionHistory };
