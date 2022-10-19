const fs = require("fs")
const usersWebFlow = JSON.parse(
  fs.readFileSync("../../../data/drupal/Users/usersDrupal.json", "utf8")
)

const authors_archive = []
const notExistsOnWebflow = []

const buildBio = (lines) => {
  let bio = "<div>"
  for (let index = 10; index < lines.length; index++) {
    bio += `<p>${lines[index]}</p>`
  }
  bio += "</div>"

  return bio
}

const getMetaDataAuthor = (fileName) => {
  let archivo = fs
    .readFileSync(
      `../../../data/ivn-archive/content/authors/${fileName}`,
      "utf-8"
    )
    .toString()
    .split("\n")

  authors_archive.push({
    fileName,
    slug: archivo[2].split(":")[1].trim(),
    displayNameAuthor: archivo[3].split(":")[1].trim(),
    emailAddressAuthor: archivo[4].split("emailAddress:")[1].trim(),
    bio: buildBio(archivo),
  })
}

// file users
const filesAuthors = fs.readdirSync(
  "../../../data/ivn-archive/content/authors/"
)

filesAuthors.forEach((fileName) => getMetaDataAuthor(fileName))

authors_archive.forEach((item) => {
  if (item.emailAddressAuthor.trim().length > 0) {
    const exist = usersWebFlow.filter(
      (x) => x.webflowUser["social-email-new"] == item.emailAddressAuthor.trim()
    )

    if (exist.length == 0) {
      notExistsOnWebflow.push(item)
    }
  }
})

// console.log(notExistsOnWebflow)

fs.writeFile(
  "../../../data/ivn-archive/Users/authors_archive.json",
  JSON.stringify(notExistsOnWebflow),
  (err) => {
    if (err) {
      return console.error("Error to create authors_archive.json: ", err)
    }
    console.log("[OK] File authors_archive.json created...")
  }
)

// console.log("authors_archive: ", authors_archive.length)
// console.log("notExistsOnWebflow: ", notExistsOnWebflow.length)
// console.log("usersWebFlow: ", usersWebFlow.length)
