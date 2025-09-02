import fs from "fs";

const getSpeechToText = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const filePath = path.join(__dirname, "../public/uploads/", req.file.filename);

        // ✅ Ensure file actually exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: "Uploaded file not found" });
        }

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