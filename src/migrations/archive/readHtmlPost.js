const fs = require("fs")
const { resolve } = require("path")
const PATH = "../../data/ivn-archive/content/news_articles/"
const authors_archive = []

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
      // `../../../data/ivn-archive/content/authors/${fileName}`,
      resolve(`../../../data/ivn-archive/content/authors/${fileName}`),
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

const buildArticleBody = (lines) => {
  // let articleBody = "<div>"
  let articleBody = ""
  for (let index = 15; index < lines.length; index++) {
    articleBody += lines[index]
  }
  // articleBody += "</div>"

  return articleBody
}

const removeEnds = (data) => {
  if (
    data &&
    data.length > 1 &&
    data.substring(0, 1) == '"' &&
    data.substring(data.length - 1, data.length) == '"'
  ) {
    return data.substring(1, data.length - 1)
  }

  return data
}

const getDataFromArticles = (fullPath) => {
  const ptg = `${PATH}${fullPath}`
  let archivo = fs.readFileSync(ptg, "utf-8").toString().split("\n")

  return {
    id: archivo[1].split("id:")[1].trim().replaceAll('"', ""),
    slug: archivo[2].split("slug:")[1].trim().replaceAll('"', ""),
    author: archivo[4].split("-")[1].trim(),
    publishedOn: archivo[6].split("publishedOn:")[1].trim().replaceAll('"', ""),
    featuredImage: archivo[9]
      .split("featuredImage:")[1]
      .trim()
      .replaceAll('"', ""),
    headline: removeEnds(archivo[10].split("headline:")[1].trim()).replaceAll(
      '\\"',
      '"'
    ),
    articleBody: buildArticleBody(archivo),
  }
}

const getFolders = (path) => fs.readdirSync(path)
const getFile = (fileName) => fs.readdirSync(PATH)

const filesByDate = (year, month, days) => {
  return days.map((day) => ({
    day,
    files: fs.readdirSync(`${PATH}${year}/${month}/${day.toString()}/`),
  }))
}

const buildEtl = () => {
  const years = getFolders(PATH)

  return years.map((year) => {
    const months = getFolders(`${PATH}${year}`)
    monthDays = months.map((month) => ({
      month,
      days: filesByDate(year, month, getFolders(`${PATH}${year}/${month}`)),
    }))

    return {
      year,
      months: monthDays,
    }
  })
}

module.exports = {
  buildEtl,
  getDataFromArticles,
}
