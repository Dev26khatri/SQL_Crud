const { faker, el } = require("@faker-js/faker");
const mySql = require("mysql2");
const express = require("express");
const app = express();
let port = 8000;
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

require("dotenv").config();
const connection = mySql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
});

//Home page
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let Count = result[0]["count(*)"];
      res.render("home.ejs", { Count });
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/NewUser", (req, res) => {
  res.render("new.ejs");
});
app.post("/NewUser", (req, res) => {
  let { username, email, password } = req.body;
  let q = `INSERT INTO user (id,username,email,password) VALUES ('${faker.string.uuid()}','${username}','${email}','${password}')`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.delete("/delete", (req, res) => {
  let { email, password } = req.body;
  let q = `delete from user where email='${email}' and password='${password}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        res.redirect("/user");
      } else {
        res.send("<body><h1>Password </h1></body>");
      }
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get("/delete/:id", (req, res) => {
  let { id } = req.params;
  let q = `SELECT*FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

//Showing Route
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      // console.log(result);
      // res.send(result);
      res.render("showusers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

//Showing the Edit Option (Not the original PATCH )
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT*FROM user where id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      // console.log(result);
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Database Error");
  }
  // res.render("edit.ejs");
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername, email: newEmail } = req.body;
  let q = `SELECT*FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("<body> <h1>Wrong Password </h1></body>");
      } else {
        let q2 = `UPDATE user SET username='${newUsername}', email='${newEmail}' WHERE id='${id}'`;
        connection.query(q2, (err, update) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get("/delete", (req, res) => {
  res.render("deleteFromHome");
});

app.listen(port, () => {
  console.log("Express Server Running At 8000 port");
});
