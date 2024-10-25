const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const fs = require("fs").promises;
const webserver = express();
const PORT = 8080;

webserver.use(express.static(path.join(__dirname)));
webserver.use(express.json());

const STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const CONTENT_TYPES = {
  JSON: "application/json",
  XML: "application/xml",
  HTML: "text/html",
  TEXT: "text/plain",
  BLOB: "application/octet-stream",
  IMG: "image",
};

// to get initial html page
webserver.get("/", (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, "index.html"));
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

// to get list of saved requests
// { info: Array<{id: number, url: string, method: string, headers: Record<string, string>, body: Record<string, string>}>}
webserver.get("/savedRequests", (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, "savedRequests.json"));
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

// to send a request from server
webserver.post("/makeRequest", async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    const response = await fetch(url, {
      method,
      headers,
      ...(method === "GET" ? {} : { body: JSON.stringify(body) }),
    });

    const contentType = response.headers.get("content-type");

    let responseData;

    if (contentType.includes(CONTENT_TYPES.JSON)) {
      responseData = await response.json();
    } else if (
      contentType.includes(CONTENT_TYPES.BLOB) ||
      contentType.includes(CONTENT_TYPES.IMG)
    ) {
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      responseData = Buffer.from(arrayBuffer).toString("base64");
    } else {
      responseData = await response.text(); // Fallback to text for other types
    }

    res.status(response.status).json({
      status: response.status,
      headers: response.headers.raw(),
      body: responseData,
    });
  } catch (err) {
    console.log(err);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

// to save a request to a file
webserver.post("/saveRequest", async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    const filePath = path.join(__dirname, "savedRequests.json");
    const data = await fs.readFile(filePath, "utf8");
    const parsedData = JSON.parse(data);

    const newId = new Date().getTime();

    parsedData.info.push({
      id: newId,
      url,
      method,
      headers: headers ? JSON.parse(headers) : "",
      body: body ? JSON.parse(body) : "",
    });

    await fs.writeFile(filePath, JSON.stringify(parsedData, null, 2));
    res
      .status(STATUS.OK)
      .send({ info: { id: newId }, message: "Request saved successfully" });
  } catch (err) {
    console.log(err);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

// to delete a request from file by id
webserver.delete("/deleteRequest", async (req, res) => {
  try {
    const { id } = req.body;

    if (id) {
      const filePath = path.join(__dirname, "savedRequests.json");
      const data = await fs.readFile(filePath, "utf8");
      const parsedData = JSON.parse(data);

      const filteredData = parsedData.info.filter((item) => item.id !== id);

      await fs.writeFile(
        filePath,
        JSON.stringify({ info: filteredData }, null, 2)
      );
      res.status(STATUS.OK).send("Request deleted successfully");
    } else {
      throw new Error("Invalid request");
    }
  } catch (err) {
    console.log(err);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is successfully running on port " + PORT);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
