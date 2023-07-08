import * as fs from "node:fs";
import * as crypto from "node:crypto";

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
  const fileRead = fs.readFileSync(path, "utf8");
  decipher.write(fileRead, "hex");
  decipher.end();
  return decrypted;
}

export function serve(port = 80) {
  let data = {}
  const app = express();
  port = 80;

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
    console.log("Server is running on port " + port);
  });

  app.get("/", (req, res) => {
    res.status(200).json({ status: "awake" });
  });

  app.get("/upload/:token", (req, res) => {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(
      `<form method='post' action='/upload/submit/${req.params.token}' enctype='multipart/form-data'>
      <input type='file' name='fileUploaded'>
      <input type='submit'>
    </form>`
    );
  });

  app.get("/files/:fileName", (req, res) => {
    downloadFile(req.params.fileName)
      .then((file) => {
        const ext = file.fileName.split(".").pop();
        res.writeHead(200, { "content-type": "application/" + ext });
        res.end(file.fileData, "base64");
      })
      .catch((err) => {
        res.status(404).send(err.message);
      });
  });

  app.get("/delete/:token", (req, res) => {
    if (req.params.token === process.env.DELETE_TOKEN) {
      deleteAll()
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.status(500).send(err.message);
        });
    } else {
      res.status(401).send("Unauthorized");
    }
  });

  app.route("/upload/submit/:token").post(function (req, res, next) {
    if (req.params.token === process.env.UPLOAD_TOKEN) {
      var form = new formidable.IncomingForm();
      form.parse(req, function (err, fields, files) {
        uploadFile(
          files.fileUploaded.filepath,
          files.fileUploaded.originalFilename
        ).then((value) => {
          console.log(value);
          res.write("File uploaded and moved!");
          res.end();
        });
      });
    } else {
      res.status(401).send("Your mum so");
    }
  });
}
