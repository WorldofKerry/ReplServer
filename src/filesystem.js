import crypto from "node:crypto";
import fs from "node:fs";

/**
 * Encrypts text data to a file
 * @param {*} path to file
 * @param {*} textData text data
 * @param {*} password of encryption
 */
export function encryptToFile(path, textData, password) {
  const iv = Buffer.alloc(16, 0);
  const key = crypto.scryptSync(password, "salt", 24);
  const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);
  let encrypted = cipher.update(textData, "utf8", "hex");
  encrypted += cipher.final("hex");

  const writeStream = fs.createWriteStream(path);

  writeStream.write(encrypted, "utf8");
  writeStream.end();

  writeStream.on("finish", () => {
    console.log(`Encryption completed and saved to ${path}`);
  });
}

/**
 * Decrypts data in a file to a text string
 * @param {*} path to file
 * @param {*} password of encryption
 * @returns decrypted text data
 */
export function decryptFromFile(path, password) {
  const iv = Buffer.alloc(16, 0);
  const key = crypto.scryptSync(password, "salt", 24);
  const decipher = crypto.createDecipheriv("aes-192-cbc", key, iv);
  try {
    const fileRead = fs.readFileSync(path, "utf8");
    console.log(`Read file with length ${fileRead.length}`);
    let decrypted = decipher.update(fileRead, "hex");
    decrypted += decipher.final();
    console.log(`Decrypted to length ${decrypted.length}`);
    return decrypted;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`Storage at \`${path}\` not found, initializing empty data object`);
      return "{}";
    }
    console.log(error);
  }
}
