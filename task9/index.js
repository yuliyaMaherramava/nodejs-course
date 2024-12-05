const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const fs = require("fs").promises;
const multer = require("multer");
const progress = require("progress-stream");
const { STATUS } = require("../utils/status");

const webserver = express();
const PORT = 8080;
const WEB_SOCKET_PORT = 5632;

let socketClients = [];
let socketTimer = 0;

webserver.use(express.json());
webserver.use(express.static(path.resolve(__dirname, "static")));
webserver.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: path.join(__dirname, "static/files") });
const uploadSingleFile = upload.single("file");

const socketServer = new WebSocket.Server({ port: WEB_SOCKET_PORT });

const addNewFileToList = async (name, comment) => {
  const filePath = path.join(__dirname, "list.json");

  const data = await fs.readFile(filePath, "utf8");
  const parsedData = JSON.parse(data);

  parsedData.files.push({ name, comment });

  await fs.writeFile(filePath, JSON.stringify(parsedData, null, 2));
};

webserver.get("/", (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, "static/index.html"));
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.get("/list", (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, "list.json"));
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.post("/upload", (req, res) => {
  const fileLength = +req.headers["content-length"];
  const fileProgress = progress({ length: fileLength });

  req.pipe(fileProgress);

  fileProgress.headers = req.headers;

  fileProgress.on("progress", (info) => {
    socketServer.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(
          JSON.stringify({
            percentage: (info.transferred / info.length) * 100,
            transferred: info.transferred,
            total: fileLength,
          })
        );
      }
    });
  });

  uploadSingleFile(fileProgress, res, async (err) => {
    if (err) {
      return res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
    }

    try {
      await fs.rename(
        fileProgress.file.path,
        path.join(__dirname, "static/files", fileProgress.file.originalname)
      );
      addNewFileToList(
        fileProgress.file.originalname,
        fileProgress.body.comment
      );

      res.json({ status: "OK" });
    } catch (err) {
      res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
    }
  });
});

webserver.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is successfully running on port " + PORT);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

socketServer.on("connection", (connection) => {
  connection.on("message", (message) => {
    if (message === "KEEP_ME_ALIVE") {
      socketClients.forEach((client) => {
        if (client.connection === connection) client.lastkeepalive = Date.now();
      });
    } else console.log("client message", message);
  });

  socketClients.push({ connection, lastkeepalive: Date.now() });
});

setInterval(() => {
  socketTimer++;
  socketClients.forEach((client) => {
    if (Date.now() - client.lastkeepalive > 50000) {
      client.connection.terminate();
      client.connection = null;
    }
  });
  socketClients = socketClients.filter((client) => client.connection);
}, 5000);
