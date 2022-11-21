const fs = require("fs")
const users = JSON.parse(fs.readFileSync("./UsersDrupal.json", "utf8"))

const indexes = {}

users.forEach((element) => {
  indexes[element.webflowUser.slug] = element.drupalUser?.data?.id || "no_tiene"
})

const saveFule = (data) => {
  fs.writeFile("./index_archiveWritters_DrupalUser.json", data, (err) => {
    if (err) {
      return console.error(
        "Error to create index_archiveWritters_DrupalUser.json: ",
        err
      )
    }
    console.log("[OK] File index_archiveWritters_DrupalUser.json created...")
  })
}

saveFule(JSON.stringify(indexes))
