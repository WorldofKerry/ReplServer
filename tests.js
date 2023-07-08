import * as main from "./main.js";
import * as assert from "node:assert";

function fileSystemTest() {
  const plainText = "Hello, World!";
  const password = "password";
  const path = `fileSystemTest.log`;

  main.encryptString(path, plainText, password);

  setTimeout(() => {
    try {
      const decrypted = main.decryptString(path, password);
      assert.strict(decrypted === plainText);
      console.log("Decrypted: " + decrypted);
    } catch (e) {
      console.log(e);
    }
  }, 1000);
}

fileSystemTest();
