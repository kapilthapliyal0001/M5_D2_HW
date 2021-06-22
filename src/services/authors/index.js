import express from "express"; // 3rd party package
import fs from "fs"; // core package
import {fileURLToPath} from "url"; // core package
import {dirname, join} from "path"; // core package
import uniqid from "uniqid"; // 3rd party package

const authorsRouter = express.Router();

// 1.  working with the file path;
const currentFilePath = fileURLToPath(import.meta.url);
const currentFolderPath = dirname(currentFilePath);

const authorsJSONPath = join(currentFolderPath, "posts.json");

//   Read the all the authors;
authorsRouter.get("/", (req, res) => {
  const authorsJSONContent = fs.readFileSync(authorsJSONPath);
  const contentASJSON = JSON.parse(authorsJSONContent);
  res.send(contentASJSON);
});
// ---------------------------

// 2.  Read individual author using specific id;

authorsRouter.get("/:id", (req, res) => {
  // id in the json data is string where as in the params of the request is
  // a number
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  // console.log(authors);
  const author = authors.find((a) => a._id === parseInt(req.params.id));
  // sending the response
  res.send(author);
  // console.log(authors);
});

// ---------------------------

// 3 .CREATE individual post using the:
// name
// surname
// ID (Unique and server generated)
// email
// date of birth
// avatar (e.g. https://ui-avatars.com/api/?name=John+Doe)
authorsRouter.post("/", (req, res) => {
  // to find the number of authors present
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  let auth_cnt = authors.length + 1;
  console.log(auth_cnt + 1, "Is the number alloted to ", req.body);

  // if the request body has the email above then return false and
  // dont add the post
  let present = 0;
  let id = 0; // to make it global
  authors.forEach((author) => {
    if (author.email === req.body.email) {
      present = 1;
      console.log("The email is present already");
    }
  });
  // old section;
  if (present == 0) {
    const newAuthor = {...req.body, _id: auth_cnt};
    id = newAuthor._id;
    authors.push(newAuthor);

    // save the file back
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authors));
  }

  // sending the proper response
  res
    .status(201)
    .send(
      present == 0 ? {_id: id} : "You are NOT allowed to enter the same email"
    );
});

// ---------------------------
//  4. delete
authorsRouter.delete("/:id", (req, res) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  // remaining authors;
  const remainingAuthors = authors.filter(
    (author) => author._id !== parseInt(req.params.id)
  );
  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors));

  // send the result of deleted
  res.status(204).send();
});
// ---------------------------
// 5. editing Author list
authorsRouter.put("/:id", (req, res) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  const remainingAuthors = authors.filter(
    (author) => author._id !== parseInt(req.params.id)
  );
  const modifiedAuth = {...req.body, _id: req.params.id};
  remainingAuthors.push(modifiedAuth);
  //changing the format and putting the file
  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors));
  res.send(modifiedAuth);
});

export default authorsRouter;
