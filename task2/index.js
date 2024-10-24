const express = require("express");
const path = require("path");
const validator = require("express-validator");
const webserver = express();
const PORT = 8080;

// for using ejs (template engine)
webserver.set("view engine", "ejs");
webserver.set("views", path.join(__dirname, "views"));

webserver.use(express.urlencoded({ extended: true }));
webserver.use(express.static(path.join(__dirname)));

const STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const createValidator = [
  validator.query("name", "Full name should not be empty").trim().notEmpty(),
  validator.query("email", "Invalid email").trim().isEmail(),
  validator.query("age", "Age must be integer").isInt(),
  validator.query("birthDate", "Invalid date of birth").isDate(),
  validator.query("phone", "Invalid mobile phone number").isMobilePhone(),
];

webserver.get("/", (req, res) => {
  try {
    res.render("view", {
      errors: [],
      name: "",
      email: "",
      age: "",
      birthDate: "",
      phone: "",
    });
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.get("/submit", createValidator, (req, res) => {
  try {
    const result = validator.validationResult(req);

    if (result.isEmpty()) {
      const data = validator.matchedData(req);
      res.render("successfulView", data);
    }
    res.render("view", { ...req.query, errors: result.array() });
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
