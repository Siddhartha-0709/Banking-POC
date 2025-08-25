import db from "./database/db.connection.js";
import app from "./app.js";

const startServer = async () => {
  try {
    await db.initDB(); // ✅ create pool once
    console.log("Database pool initialized");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
