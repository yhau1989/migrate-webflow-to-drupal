const fs = require("fs");
const postsWebFlow = JSON.parse(
  fs.readFileSync("../../data/webflow/posts.json", "utf8")
);

const oneItem = postsWebFlow.filter(item => item._id == "62716f3a35c7ce1c5ad5a920");


console.log(oneItem[0].body);

