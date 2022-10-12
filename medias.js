
const fs = require("fs");

const medias = JSON.parse(
    fs.readFileSync("./data/webflow/posts.json", "utf8")
  );

 const g = medias.filter(user => user.media?.metadata?.provider_name);
 const s = new Set(g.map(x => x.media?.metadata?.provider_name))

  console.log(s);

  
