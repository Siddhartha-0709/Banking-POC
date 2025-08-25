import oracledb from "oracledb";
import db from "../database/db.connection.js";

/**
 * Create new customer
 */
const createCustomer = async (req, res) => {
  let connection;
  try {
    const { full_name, email, phone, address } = req.body;
    connection = await db.getConnection();

    const result = await connection.execute(
      `INSERT INTO xxkpmg_customers_tbl_bnk 
         (full_name, email, phone, address)
       VALUES (:full_name, :email, :phone, :address)
       RETURNING customer_id INTO :id`,
      {
        full_name,
        email,
        phone,
        address,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Customer created successfully",
      customer_id: result.outBinds.id[0],
    });
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).json({ error: "Failed to create customer" });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * Get customer by ID
 */
const getCustomerById = async (req, res) => {
  let connection;
  try {
    const { id } = req.query;
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT customer_id, full_name, email, phone, address, created_at, updated_at
         FROM xxkpmg_customers_tbl_bnk 
        WHERE customer_id = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching customer:", err);
    res.status(500).json({ error: "Failed to fetch customer" });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * Update customer
 */
const updateCustomer = async (req, res) => {
  let connection;
  try {
    const { full_name, email, phone, address, id } = req.body;
    connection = await db.getConnection();

    const result = await connection.execute(
      `UPDATE xxkpmg_customers_tbl_bnk
          SET full_name = :full_name,
              email = :email,
              phone = :phone,
              address = :address,
              updated_at = SYSTIMESTAMP
        WHERE customer_id = :id`,
      { full_name, email, phone, address, id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer updated successfully" });
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ error: "Failed to update customer" });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * Get all accounts of a customer
 */
const getCustomerAccounts = async (req, res) => {
  let connection;
  try {
    const { id } = req.query;
    connection = await db.getConnection();

    const result = await connection.execute(
      `SELECT account_id, account_type, balance, status, created_at
         FROM xxkpmg_accounts_tbl_bnk
        WHERE customer_id = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  } finally {
    if (connection) await connection.close();
  }
};

export { createCustomer, getCustomerById, updateCustomer, getCustomerAccounts };
