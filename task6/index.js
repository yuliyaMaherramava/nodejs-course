const express = require("express");
const path = require("path");
const validator = require("express-validator");
const exphbs = require("express-handlebars");
const webserver = express();
const PORT = 8080;

// for using handlebars (template engine)
webserver.engine("handlebars", exphbs.engine());
webserver.set("view engine", "handlebars");
webserver.set("views", path.join(__dirname, "views"));

webserver.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
webserver.use(express.static(path.join(__dirname, "static")));

const STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  REDIRECT: 303,
};

const createValidator = [
  validator.body("name", "Full name should not be empty").trim().notEmpty(),
  validator.body("email", "Invalid email").trim().isEmail(),
  validator.body("age", "Age must be integer").isInt(),
  validator.body("birthDate", "Invalid date of birth").isDate(),
  validator.body("phone", "Invalid mobile phone number").isMobilePhone(),
];

webserver.get("/", (req, res) => {
  try {
    res.render("default_page", {
      layout: "main",
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

webserver.post("/submit", createValidator, (req, res) => {
  try {
    const result = validator.validationResult(req);

    if (result.isEmpty()) {
      const data = validator.matchedData(req);

      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => params.append(key, value));

      res.redirect(STATUS.REDIRECT, `/results?${params.toString()}`);
    }
    res.render("default_page", {
      layout: "main",
      ...req.body,
      errors: result.array(),
    });
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.get("/results", (req, res) => {
  try {
    res.render("details_page", {
      layout: "main",
      ...req.query,
    });
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
