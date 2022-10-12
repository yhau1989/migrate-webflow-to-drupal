const fs = require("fs");
const users = JSON.parse(
  fs.readFileSync("./UsersDrupal.json", "utf8")
);

const indexes = {};

users.forEach((element) => {
  indexes[element.webflowUser._id] = element.drupalUser.data.id;
});

const saveFule = (data) => {
  fs.writeFile("./index_WebflowUser_DrupalUser.json", data, (err) => {
    if (err) {
      return console.error(
        "Error to create index_WebflowUser_DrupalUser.json: ",
        err
      );
    }
    console.log("[OK] File index_WebflowUser_DrupalUser.json created...");

    // fs.unlink("TopicsBq.json", (err2) => {
    //   if (err2) {
    //     return console.error("Error to delete file TopicsBq.json: ", err2);
    //   }
    //   console.log("[OK] File TopicsBq.json deleted...");
    // });
  });
};

saveFule(JSON.stringify(indexes))
