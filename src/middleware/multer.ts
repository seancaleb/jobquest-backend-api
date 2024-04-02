import multer from "multer";
import path from "path";
import fs from "fs";

const avatarsDirPath = __dirname + "../../tmp/avatar-uploads";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdir(avatarsDirPath, { recursive: true }, (err) => {
      if (err) {
        console.warn(err);
      } else {
        cb(null, avatarsDirPath);
      }
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2097152,
  },
});

export default upload;
