import fs from "node:fs";
import express from "express";
import formidable from "formidable";
import { encryptToFile, decryptFromFile } from "./filesystem.js";

const STORAGE_PATH = "storage.log";

function initialize(envVars) {
  console.log("Initializing");
  const rawData = decryptFromFile(
    STORAGE_PATH,
    envVars.getFileSystemPassword()
  );
  let data = {};
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    console.log(e);
  }
  console.log("Data keys:", Object.keys(data));
  return data;
}

/**
 * Checks if API token is valid, if so return true, otherwise send 401 and return false
 * @param {*} token to be checked
 * @param {*} envVars environment variables
 * @param {*} res response object
 * @returns is API token valid
 */
function checkToken(token, envVars, res) {
  if (token === envVars.getApiToken()) return true;
  res.status(401).send("Unauthorized");
  return false;
}

export function serve({ port = 8080, envVars = undefined } = {}) {
  const DATA_TYPES = {
    file: "file",
  };
  const HTML_FILE_INPUT_NAME = "files";
  const HTML_KEY_INPUT_NAME = "key";
  const URLS = {
    SUBMIT: "file/put/submit",
  };

  let storage = initialize(envVars);
  setInterval(() => {
    encryptToFile(
      STORAGE_PATH,
      JSON.stringify(storage),
      envVars.getFileSystemPassword()
    );
  }, 10000);

  const app = express();

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

  app.get("/:token/file/put", (req, res) => {
    res.send(`
    <h1>Upload File</h1>
    <form action="/${req.params.token}/${URLS.SUBMIT}" enctype="multipart/form-data" method="post">
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

  app.get("/:token/file/get/:key", (req, res) => {
    if (checkToken(req.params.token, envVars, res)) {
      const value = storage[req.params.key];
      if (value.type === DATA_TYPES.file) {
        console.log("Extension is " + value.ext);
        res.writeHead(200, { "content-type": "application/" + value.ext });
        res.end(value.data, "base64");
      } else {
        res.end(value.data, "utf8");
      }
    }
  });

  app.get("/:token/file/delete/:key", (req, res) => {
    if (checkToken(req.params.token, envVars, res)) {
      delete storage[req.params.key];
    }
  });

  app.route(`/:token/${URLS.SUBMIT}`).post(function (req, res, next) {
    if (checkToken(req.params.token, envVars, res)) {
      const form = formidable({});

      form.parse(req, (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }
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
            originalFilename: file.originalFilename,
            lastModifiedDate: file.lastModifiedDate,
            path: file.path,
            mimetype: file.mimetype,
          };
          console.log(`Uploaded file: ${file.originalFilename} as ${key}`);
        }
        res.send("Uploaded");
      });
    } else {
      res.status(401).send("Unauthorized");
    }
  });
}
