import * as assert from "node:assert";
import { encryptToFile, decryptFromFile } from "../src/filesystem.js";
import fs from "node:fs";

function fileSystemTest() {
  const data = {
    testing: "123",
  };
  const password = "password";
  const path = `fileSystemTest.log`;

  const stringified = JSON.stringify(data);

  encryptToFile(path, stringified, password);
  fs.writeFileSync(`raw${path}`, stringified); // For debugging

  setTimeout(() => {
    try {
      const decrypted = decryptFromFile(path, password);
      assert.strict(decrypted === stringified);
      console.log("Decrypted: " + decrypted);
    } catch (e) {
      console.log(e);
    }
  }, 1000);
}

fileSystemTest();
