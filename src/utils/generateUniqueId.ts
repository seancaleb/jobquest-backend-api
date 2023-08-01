import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 10);

const generateUniqueId = (title: string) => {
  return `${title}_${nanoid()}`;
};

export default generateUniqueId;
