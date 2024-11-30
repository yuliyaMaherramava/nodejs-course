const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./db-config");

const webserver = express();
const PORT = 8080;

webserver.use(bodyParser.json());
webserver.use(express.static(path.resolve(__dirname, "static")));

const STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  REDIRECT: 303,
};

webserver.get("/", (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, "static/index.html"));
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.post("/execute", async (req, res) => {
  const query = req.body.query.trim();

  if (!query) {
    return res
      .status(STATUS.BAD_REQUEST)
      .json({ error: "SQL query is required" });
  }

  try {
    const result = await db.execute(query);

    if (query.toLowerCase().startsWith("select")) {
      res.json({ type: "select", data: result[0], fields: result[1] });
    } else if (
      query.toLowerCase().startsWith("show") ||
      query.toLowerCase().startsWith("describe")
    ) {
      res.json({ type: "show", data: result[0] });
    } else {
      res.json({ type: "modification", data: result[0] });
    }
  } catch (err) {
    res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ type: "error", message: err.message });
  }
});

webserver.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is successfully running on port " + PORT);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
