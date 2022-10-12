const fs = require("fs");

const postWbflow = JSON.parse(
  fs.readFileSync(
    "../../data/webflow/posts_0.json",
    "utf8"
  )
);

const Process = JSON.parse(
  fs.readFileSync(
    "../../data/drupal/Posts/PostsDrupal_step1.json",
    "utf8"
  )
);

const okProcess = Process.map(x => x.idWebFlow);
const NoProcess = postWbflow.filter(c => !okProcess.includes(c._id));





const saveLogPostsDrupal = (data) => {
    fs.writeFile("../../data/webflow/posts.json", data, (err) => {
      if (err) {
        return console.error("Error to create posts.json: ", err);
      }
      console.log("[OK] File posts.json created...");
  
      // fs.unlink("TopicsBq.json", (err2) => {
      //   if (err2) {
      //     return console.error("Error to delete file TopicsBq.json: ", err2);
      //   }
      //   console.log("[OK] File TopicsBq.json deleted...");
      // });
    });
  };


  saveLogPostsDrupal(JSON.stringify(NoProcess));