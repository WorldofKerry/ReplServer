import { Buffer } from "node:buffer";
import { scryptSync, createDecipheriv } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { Readable, pipeline } from "node:stream";

class Counter extends Readable {
  constructor(opt) {
    super(opt);
    this._max = 50;
    this._index = 1;
  }

  _read() {
    const i = this._index++;
    if (i > this._max) this.push(null);
    else {
      const str = String(i);
      const buf = Buffer.from(str, "ascii");
      console.log(buf);
      this.push(buf);
    }
  }
}

function getData() {
  const algorithm = "aes-192-cbc";
  const password = "Password used to generate key";
  // Key length is dependent on the algorithm. In this case for aes192, it is
  // 24 bytes (192 bits).
  // Use the async `crypto.scrypt()` instead.
  const key = scryptSync(password, "salt", 24);
  // The IV is usually passed along with the ciphertext.
  const iv = Buffer.alloc(16, 0); // Initialization vector.

  const decipher = createDecipheriv(algorithm, key, iv);

  let decrypted = "";
  decipher.on("readable", () => {
    let chunk;
    while (null !== (chunk = decipher.read())) {
      decrypted += chunk.toString("utf8");
    }
  });

  // Encrypted with same algorithm, key and iv.
  const encrypted =
    "e5f79c5915c02171eec6b212d5520d44480993d7d622a7c4c2da32f6efda0ffa";

  const c = new Counter();
  decipher.pipe(c);
  //   decipher.write(encrypted, "hex");
  decipher.end();
  console.log(decrypted);
}

getData();
