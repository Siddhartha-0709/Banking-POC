import { fileURLToPath } from "url";
import path from "path";
import { nodewhisper } from "nodejs-whisper";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Speech-to-text function
const getSpeechToText = async (req, res) => {
    try {
        // uploaded file path from multer
        const filePath = path.join(__dirname, "../public/uploads/", req.file.filename);

        // Run whisper
        const result = await nodewhisper(filePath, {
            modelName: "base.en",
            autoDownloadModelName: "base.en",
            withCuda: false,
            logger: console,
            whisperOptions: {
                outputInJson: false,
                outputInJsonFull: false,
                outputInText: true,   // ✅ Plain text output
                outputInSrt: false,
                outputInWords: false,
                wordTimestamps: false,
                timestamps_length: 0  // ✅ Disable segment timestamps
            },
        });
        const cleanTranscription = result.replace(/\[\d{2}:\d{2}:\d{2}\.\d{3} --> .*?\]/g, "").trim();

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
