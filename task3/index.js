const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const webserver = express();
const PORT = 8080;

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

const getStatisticsFilePath = () => path.join(__dirname, "statistics.json");

const changeStatistics = async (voteKey) => {
  const filePath = getStatisticsFilePath();

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

    if (!vote) {
      return res.status(STATUS.BAD_REQUEST).send("Invalid request");
    }

    await changeStatistics(vote);
    res.status(STATUS.OK).send("Statistics updated");
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.post("/downloadStats", async (req, res) => {
  try {
    const { accept } = req.headers;

    const filePath = getStatisticsFilePath();
    const data = await fs.readFile(filePath, "utf8");
    const statData = JSON.parse(data);

    res.setHeader("Content-Type", accept || CONTENT_TYPES.TEXT);

    switch (accept) {
      case CONTENT_TYPES.JSON:
        res.sendFile(filePath);
        break;
      case CONTENT_TYPES.XML:
        const xmlData = Object.entries(statData)
          .map(([key, value]) => {
            const option = variants.find((option) => option.value === key);
            return `<pizza><name>${option.label}</name><count>${value}</count></pizza>`;
          })
          .join("");
        res.send(`<pizzas>${xmlData}</pizzas>`);
        break;
      case CONTENT_TYPES.HTML:
        const htmlData = Object.entries(statData)
          .map(([key, value]) => {
            const option = variants.find((option) => option.value === key);
            return `<p>${option.label}: ${value}</p>`;
          })
          .join("");
        res.send(`<div>${htmlData}</div>`);
        break;
      default:
        res.send(JSON.stringify(statData, null, 2));
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
