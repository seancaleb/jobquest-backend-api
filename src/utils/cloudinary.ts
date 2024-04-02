import { v2 as cloudinary } from "cloudinary";
import config from "config";

cloudinary.config({
  cloud_name: config.get("cloudName"),
  api_key: config.get("cloudKey"),
  api_secret: config.get("cloudSecret"),
});

export default cloudinary;
