import fs from "fs";
import path from "path";
import { nodewhisper } from "nodejs-whisper";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getSpeechToText = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // ✅ Use multer's absolute path instead of rebuilding
        const filePath = req.file.path;

        // Ensure file exists
        await fs.promises.access(filePath, fs.constants.R_OK);

        // Run whisper
        const result = await nodewhisper(filePath, {
            modelName: "base.en",
            autoDownloadModelName: "base.en",
            withCuda: false,
            logger: console,
            whisperOptions: {
                outputInText: true,
                outputInJson: false,
                timestamps_length: 0,
            },
        });

        const cleanTranscription = result
            .replace(/\[\d{2}:\d{2}:\d{2}\.\d{3} --> .*?\]/g, "")
            .trim();

        return res.json({
            success: true,
            transcription: cleanTranscription,
        });

    } catch (error) {
        console.error("Error in transcription:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process audio",
            error: error.message,
        });
    }
};

export { getSpeechToText };
