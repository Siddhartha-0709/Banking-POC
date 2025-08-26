import oracledb from "oracledb";
import db from "../database/db.connection.js";

/**
 * Create a new account for a customer
 */
const createAccount = async (req, res) => {
  let connection;
  try {
    const { customer_id, account_type, initial_balance } = req.body;
    connection = await db.getConnection();

    const result = await connection.execute(
      `INSERT INTO xxkpmg_accounts_tbl_bnk 
         (customer_id, account_type, balance, status)
       VALUES (:customer_id, :account_type, :balance, 'ACTIVE')
       RETURNING account_id INTO :id`,
      {
        customer_id,
        account_type,
        balance: initial_balance || 0,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Account created successfully",
      account_id: result.outBinds.id[0],
    });
  } catch (err) {
    console.error("Error creating account:", err);
    res.status(500).json({ error: "Failed to create account" });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * Get account by ID
 */
const getAccountById = async (req, res) => {
  let connection;
  try {
    const { id } = req.query;
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT account_id, customer_id, account_type, balance, status, created_at
         FROM xxkpmg_accounts_tbl_bnk 
        WHERE account_id = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching account:", err);
    res.status(500).json({ error: "Failed to fetch account" });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * Update account (status/type)
 */
const updateAccount = async (req, res) => {
  let connection;
  try {
    const { id } = req.query;
    const { account_type, status } = req.body;
    connection = await db.getConnection();
    console.log("Updating account:", id, account_type, status);
    
    const result = await connection.execute(
      `UPDATE xxkpmg_accounts_tbl_bnk
          SET account_type = NVL(:ACCOUNT_TYPE, account_type),
              status       = NVL(:STATUS, status),
              updated_at   = SYSTIMESTAMP
        WHERE account_id = :ID`,
      {
        ACCOUNT_TYPE: account_type || null,
        STATUS: status || null,
        ID: id,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ message: "Account updated successfully" });
  } catch (err) {
    console.error("Error updating account:", err);
    res.status(500).json({ error: "Failed to update account" });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * Get account balance
 */
const getAccountBalance = async (req, res) => {
  let connection;
  try {
    const { id } = req.query;
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT balance 
         FROM xxkpmg_accounts_tbl_bnk 
        WHERE account_id = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ account_id: id, balance: result.rows[0].BALANCE });
  } catch (err) {
    console.error("Error fetching balance:", err);
    res.status(500).json({ error: "Failed to fetch balance" });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * Close (deactivate) account
 */
const closeAccount = async (req, res) => {
  let connection;
  try {
    const { id } = req.query;
    connection = await db.getConnection();

    const result = await connection.execute(
      `UPDATE xxkpmg_accounts_tbl_bnk
          SET status = 'CLOSED', updated_at = SYSTIMESTAMP
        WHERE account_id = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ message: "Account closed successfully" });
  } catch (err) {
    console.error("Error closing account:", err);
    res.status(500).json({ error: "Failed to close account" });
  } finally {
    if (connection) await connection.close();
  }
};

export {
  createAccount,
  getAccountById,
  updateAccount,
  getAccountBalance,
  closeAccount,
};
