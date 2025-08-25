import oracledb from "oracledb";
import db from "../database/db.connection.js";

/**
 * User Login
 */
const login = async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    connection = await db.getConnection();

    // Validate user credentials
    const authResult = await connection.execute(
      `SELECT auth_id, customer_id, email
         FROM xxkpmg_authentication_tbl_bnk
        WHERE email = :email AND password = :password`,
      { email, password },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (authResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const customerId = authResult.rows[0].CUSTOMER_ID;

    // Fetch customer + account details (old Oracle join style)
    const result = await connection.execute(
      `SELECT c.customer_id,
              c.full_name,
              c.email,
              c.phone,
              c.address,
              a.account_id,
              a.IFSC_code,
              a.branch_name,
              a.account_type,
              a.balance,
              a.status,
              a.created_at
         FROM xxkpmg_customers_tbl_bnk c, xxkpmg_accounts_tbl_bnk a
        WHERE c.customer_id = a.customer_id
          AND c.customer_id = :customerId`,
      { customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      message: "Login successful",
      customer: {
        customer_id: result.rows[0]?.CUSTOMER_ID,
        full_name: result.rows[0]?.FULL_NAME,
        email: result.rows[0]?.EMAIL,
        phone: result.rows[0]?.PHONE,
        address: result.rows[0]?.ADDRESS,
      },
      accounts: result.rows.map((row) => ({
        account_id: row.ACCOUNT_ID,
        IFCS_code: row.IFCS_CODE,
        branch_name: row.BRANCH_NAME,
        account_type: row.ACCOUNT_TYPE,
        balance: row.BALANCE,
        status: row.STATUS,
        created_at: row.CREATED_AT,
      })),
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Login failed" });
  } finally {
    if (connection) await connection.close();
  }
};

export { login };
