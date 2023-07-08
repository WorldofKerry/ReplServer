import * as fs from "node:fs";
import * as crypto from "node:crypto";

function encryptString(plainText, password) {
  const iv = Buffer.alloc(16, 0);
  const key = crypto.scryptSync(password, "salt", 24);
  const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const writeStream = fs.createWriteStream("encrypted.txt");

  writeStream.write(encrypted, "utf8");
  writeStream.end();

  writeStream.on("finish", () => {
    console.log("Encryption completed and saved to encrypted.txt");
  });
}

function decryptString(path, password) {
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
  const fileRead = fs.readFileSync(path, "utf8");
  decipher.write(fileRead, "hex");
  decipher.end();
  return decrypted;
}

const plainText = "Hello, World!";
const password = "password";

encryptString(plainText, password);

try {
  console.log("Decrypted: " + decryptString("encrypted.txt", password));
} catch (e) {
  console.log(e);
}
