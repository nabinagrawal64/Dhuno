import multer from "multer";

// MEMORY STORAGE
// Files stay in RAM temporarily then directly uploaded to Cloudinary
const storage = multer.memoryStorage();

// FILE FILTER
const fileFilter: multer.Options["fileFilter"] = ( req, file, cb ) => {

    // IMAGE TYPES
    const imageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
    ];

    // AUDIO TYPES
    const audioTypes = [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/mp4",
        "audio/x-m4a",
    ];

    // ACCEPT IMAGE
    if (imageTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
    }

    // ACCEPT AUDIO
    if (audioTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
    }

    // REJECT
    cb(
        new Error(
            "Only image and audio files are allowed"
        )
    );
};

// MULTER CONFIG
const upload = multer({
    storage,
    fileFilter,
    limits: {
        // 25MB
        fileSize: 25 * 1024 * 1024,
    },
});

export default upload;