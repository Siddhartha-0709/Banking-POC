// middleware/multer.middleware.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // ✅ always absolute path
  },
  filename: (req, file, cb) => {
    const uniqueName = `recording-${Date.now()}.wav`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
