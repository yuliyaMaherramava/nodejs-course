const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const webserver = express();
const PORT = 7880;

webserver.use(express.json());

const STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const variants = [
  { value: "pep", label: "Pepppperoni" },
  { value: "neap", label: "Neapolitan" },
  { value: "marg", label: "Margherita" },
  { value: "marin", label: "Marinara" },
  { value: "calz", label: "Calzone" },
  { value: "capr", label: "Capricciosa" },
  { value: "quatt", label: "Quattro Stagioni" },
  { value: "frut", label: "Frutti di Mare" },
];

const changeStatistics = async (voteKey) => {
  const filePath = path.join(__dirname, "statistics.json");

  const data = await fs.readFile(filePath, "utf8");
  const statData = JSON.parse(data);

  if (!statData.hasOwnProperty(voteKey)) {
    throw new Error(`Code ${vote} not found in JSON.`);
  }

  statData[voteKey] += 1;

  await fs.writeFile(filePath, JSON.stringify(statData, null, 2));
};

webserver.get("/", (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, "index.html"));
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.get("/variants", (req, res) => {
  try {
    res.json(variants);
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.post("/stat", (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, "statistics.json"));
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.post("/vote", async (req, res) => {
  try {
    const { vote } = req.body;

    if (vote) {
      console.log("Vote:", vote);
      await changeStatistics(vote);
      res.status(STATUS.OK).send("Statistics updated");
    } else {
      res.status(STATUS.BAD_REQUEST).send("Invalid request");
    }
  } catch (err) {
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
