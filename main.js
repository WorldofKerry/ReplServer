import * as fs from "node:fs";
import * as crypto from "node:crypto";
import express from "express";
import formidable from "formidable";
import dotenv from "dotenv";

dotenv.config();

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
    decipher.write(fileRead, "hex");
    decipher.end();
    return decrypted;
  } catch (e) {
    console.log(e);
    return "{}";
  }
}

export function serve(port = 80) {
  const DATA_TYPES = {
    file: "file",
  };
  const STORAGE_PATH = "storage.log";
  const HTML_FILE_INPUT_NAME = "fileUploaded";
  const HTML_KEY_INPUT_NAME = "key";

  function initialize() {
    const rawData = decryptString(STORAGE_PATH, process.env.CIPHER_PASSWORD);
    try {
      const data = JSON.parse(rawData);
      return data;
    } catch (e) {
      console.log(`Raw data: ${rawData}`);
      return {};
    }
  }

  let storage = initialize();
  setInterval(() => {
    encryptString(
      STORAGE_PATH,
      JSON.stringify(storage),
      process.env.CIPHER_PASSWORD
    );
  }, 10000);

  const app = express();
  port = 8080;

  // Log Requests by time
  app.use((req, res, next) => {
    console.log(
      `${new Date().toISOString()} => ${
        req.headers["x-forwarded-for"] || req.socket.remoteAddress
      } : ${req.method} ${req.path}`
    );
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // what this?

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  app.get("/", (req, res) => {
    res.status(200).json({ status: "awake" });
  });

  app.get("/upload/:token", (req, res) => {
    res.send(`
    <h1>Upload File</h1>
    <form action="/upload/submit/${req.params.token}" enctype="multipart/form-data" method="post">
      <div>Key (defaults to filename with extension): 
        <input type="text" name="${HTML_KEY_INPUT_NAME}" />
      </div>
      <div>File: 
        <input type="file" name="${HTML_FILE_INPUT_NAME}" multiple="multiple" />
      </div>
      <input type="submit" value="Upload" />
    </form>
  `);
  });

  app.get("/get/:key", (req, res) => {
    const value = storage[req.params.key];
    if (value.type === DATA_TYPES.file) {
      console.log("Extension is " + value.ext);
      res.writeHead(200, { "content-type": "application/" + value.ext });
      res.end(value.data, "base64");
    } else {
      res.end(value.data, "utf8");
    }
  });

  app.get("/delete/:key/:token", (req, res) => {
    if (req.params.token === process.env.DELETE_TOKEN) {
      delete storage[req.params.key];
    } else {
      res.status(401).send("Unauthorized");
    }
  });

  app.route("/upload/submit/:token").post(function (req, res, next) {
    if (req.params.token === process.env.UPLOAD_TOKEN) {
      const form = formidable({});

      form.parse(req, (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }
        // console.log(
        //   `fields: ${JSON.stringify(fields)}, files: ${JSON.stringify(files)}`
        // );
        for (let i = 0; i < files[HTML_FILE_INPUT_NAME].length; i++) {
          // Currently only one file upload is supported
          const file = files[HTML_FILE_INPUT_NAME][i];
          const key =
            fields[HTML_KEY_INPUT_NAME][i] === ""
              ? file.originalFilename
              : fields[HTML_KEY_INPUT_NAME][i];
          storage[key] = {
            ext: key.split(".").pop(),
            type: DATA_TYPES.file,
            data: fs.readFileSync(file.filepath, { encoding: "base64" }),
            ...file,
          };
          console.log(`Uploaded file: ${file.originalFilename} as ${key}`);
        }
      });
    }
  });
}
serve();
