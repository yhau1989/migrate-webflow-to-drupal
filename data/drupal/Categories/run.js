const fs = require("fs");
const categories = JSON.parse(
  fs.readFileSync("./CategoriesDrupal.json", "utf8")
);

const indexes = {};

categories.forEach((element) => {
  indexes[element.webflowCategorie._id] = element.drupalCategorie.data.id;
});

const saveFule = (data) => {
  fs.writeFile("./index_WebflowCat_DrupalCat.json", data, (err) => {
    if (err) {
      return console.error(
        "Error to create index_WebflowCat_DrupalCat.json: ",
        err
      );
    }
    console.log("[OK] File index_WebflowCat_DrupalCat.json created...");

    // fs.unlink("TopicsBq.json", (err2) => {
    //   if (err2) {
    //     return console.error("Error to delete file TopicsBq.json: ", err2);
    //   }
    //   console.log("[OK] File TopicsBq.json deleted...");
    // });
  });
};

saveFule(JSON.stringify(indexes))
