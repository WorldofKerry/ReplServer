import * as assert from "node:assert";
import { encryptString, decryptString } from "../src/filesystem.js";

function fileSystemTest() {
  const plainText = "Hello, World!";
  const password = "password";
  const path = `fileSystemTest.log`;

  encryptString(path, plainText, password);

  setTimeout(() => {
    try {
      const decrypted = decryptString(path, password);
      assert.strict(decrypted === plainText);
      console.log("Decrypted: " + decrypted);
    } catch (e) {
      console.log(e);
    }
  }, 1000);
}

fileSystemTest();
