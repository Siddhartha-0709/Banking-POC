import oracledb from "oracledb";
import "dotenv/config";

let pool;

const initDB = async () => {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log("✅ Oracle DB Pool created successfully");
  } catch (error) {
    console.error("❌ Error creating DB pool:", error);
    throw new Error("Database pool creation failed");
  }
};

const getConnection = async () => {
  if (!pool) {
    throw new Error("Pool not initialized. Call initDB first.");
  }
  return await pool.getConnection();
};

export default { initDB, getConnection };
