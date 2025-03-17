const multer = require("multer");
const fs = require("fs");
const path = require("path");


const UPLOADS_FOLDER = path.join(__dirname, "../uploads");


const createMulterStorage = (uploadFolder) => {
  const uploadDir = path.join(UPLOADS_FOLDER, uploadFolder);


  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname.replace(/\\/g, "/")}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and JPG files are allowed"), false);
  }
};


const createUploader = (folderName, fileLimit = 5 * 1024 * 1024) => {
  return multer({
    storage: createMulterStorage(folderName),
    limits: { fileSize: fileLimit },
    fileFilter,
  });
};


module.exports = createUploader;
