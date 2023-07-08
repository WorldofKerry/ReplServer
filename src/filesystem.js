import crypto from "node:crypto";
import fs from "node:fs";

export function encryptString(path, plainText, password) {
  const iv = Buffer.alloc(16, 0);
  const key = crypto.scryptSync(password, "salt", 24);
  const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const writeStream = fs.createWriteStream(path);

  writeStream.write(encrypted, "utf8");
  writeStream.end();

  writeStream.on("finish", () => {
    console.log(`Encryption completed and saved to ${path}`);
  });
}

export function decryptString(path, password) {
  const iv = Buffer.alloc(16, 0);
  const key = crypto.scryptSync(password, "salt", 24);
  const decipher = crypto.createDecipheriv("aes-192-cbc", key, iv);
  let decrypted = "";
  decipher.on("readable", () => {
    let chunk;
    while (null !== (chunk = decipher.read())) {
      decrypted += chunk.toString("utf8");
    }
  });
  try {
    const fileRead = fs.readFileSync(path, "utf8");
    console.log("Read File:", fileRead);
    decipher.write(fileRead, "hex");
    decipher.end();
    return decrypted;
  } catch (e) {
    console.log(e);
    return "{}";
  }
}
