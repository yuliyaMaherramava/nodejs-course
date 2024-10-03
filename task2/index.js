const express = require("express");
const path = require("path");
const validator = require("express-validator");
const webserver = express();
const PORT = 8080;

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

const renderSuccessfulResponse = (data) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Book your place!</title>
       <link rel="stylesheet" href="styles.css" />
    </head>
  <body>
    <div class="container">
        <p class="bookedMessage">The following person has been booked a place for the conference successfully:</p>
        <p>Name: ${data.name}</p>
        <p>Email: ${data.email}</p>
        <p>Age: ${data.age}</p>
        <p>Date of birth: ${data.birthDate}</p>
        <p>Mobile Phone: ${data.phone}</p>
        <p class="bookedMessage">Thanks for registration! Happy to see you! </p>
    </div>
    </body>
    </html>`;
};

const renderErrorResponse = (values, errors) => {
  const { name, email, age, birthDate, phone } = values;
  const errorMessages = errors
    .map((error) => `<li class="error">${error.msg}</li>`)
    .join("");

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Book your place!</title>
       <link rel="stylesheet" href="styles.css" />
    </head>
  <body>
    <div class="container">
      <h1>Book a place on the conference</h1>
      We found errors in your form. Please correct them and send again: <ul class="errorContainer">${errorMessages}</ul>
      <form action="/submit" method="GET" id="registrationForm">
        <label for="name">Full Name:</label>
        <input type="text" id="name" name="name" value="${name}" />
        <br /><br />
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" value="${email}" />
        <br /><br />
        <label for="age"> Age:</label>
        <input type="number" id="age" name="age" value="${age}" />
        <br /><br />
        <label for="birthDate">Date of birth:</label>
        <input type="date" id="birthDate" name="birthDate" value="${birthDate}" />
        <br /><br />
        <label for="phone">Mobile Phone:</label>
        <input type="text" id="phone" name="phone" value="${phone}" />
        <br /><br />
        <button type="submit">Book</button>
      </form>
    </div>
  </body>
</html>`;
};

webserver.get("/", (req, res) => {
  try {
    res.sendFile(path.resolve(__dirname, "index.html"));
  } catch (err) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(err);
  }
});

webserver.get("/submit", createValidator, (req, res) => {
  try {
    const result = validator.validationResult(req);

    if (result.isEmpty()) {
      const data = validator.matchedData(req);
      return res.send(renderSuccessfulResponse(data));
    }

    res.send(renderErrorResponse(req.query, result.array()));
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
