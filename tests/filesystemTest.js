import * as assert from "node:assert";
import { encryptToFile, decryptFromFile } from "../src/filesystem.js";
import fs from "node:fs";
import path from "node:path";

function fileSystemTest() {
  const data = JSON.parse(
    JSON.stringify({
      testing: "123",
      abc: "def",
      nested: {
        dicts: {
          are: "so cool",
        },
      },
    })
  );
  const password = "password";

  const storagePath = path.posix.parse(`fileSystemTest.log`);
  const debugPath = {
    ...storagePath,
    name: storagePath.name + "Raw",
    base: undefined, // base takes priority over name + ext
  };

  encryptToFile(path.format(storagePath), JSON.stringify(data), password);
  fs.writeFileSync(path.format(debugPath), JSON.stringify(data, null, "  ")); // For debugging

  setTimeout(() => {
    try {
      const decryptedData = decryptFromFile(path.format(storagePath), password);
      assert.notStrictEqual(JSON.parse(decryptedData), data);
      console.log("Decrypted: " + decryptedData);
    } catch (e) {
      console.log("fileSystemTest:", e);
    }
  }, JSON.stringify(data).length); // timeout proportional to data length
}

fileSystemTest();
