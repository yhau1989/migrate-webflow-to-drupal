const fs = require("fs")
const arrayPaginate = require("array-paginate")
const services = require("../../services/420TimesPots")
const posts = JSON.parse(
  fs.readFileSync("../../data/writters/posts.json", "utf8")
)

const items = posts.length
const rowsPerPage = 50
const totalsPages = arrayPaginate(posts, 1, rowsPerPage).totalPages
let datas = {}

async function updateWritters() {
  let currentPage = 1
  let result = []
  let results = []
  while (currentPage <= totalsPages) {
    datas = arrayPaginate(posts, currentPage, rowsPerPage)
    result = await runCreations(datas)
    results = [...results, ...result]
    currentPage++
  }
  await saveLogCategorieDrupal(JSON.stringify(results))
}

const runCreations = async (_dataCategories) => {
  const requests = _dataCategories.docs.map((categorie) =>
    services.createCategorie(createBodyDrupal(categorie), categorie)
  )

  const runData = await Promise.all(requests)
    .then((values) => ({ error: 0, values }))
    .catch((reason) => {
      console.log("reason: ", reason)
      return { error: 1, reason }
    })

  if (runData.error == 0) {
    // console.log(runData.values);
    return runData.values
  }
  return []
}

const createBodyDrupal = (itemWebFlow) => {
  return {
    data: {
      type: "taxonomy_term--categories",
      attributes: {
        // name: itemWebFlow.name.replace(/[^0-9a-z-A-Z ]/g, "").replace(/ +/, "").replace("  ", " ").trim(),
        name: itemWebFlow.name,
        description: {
          value: itemWebFlow.description || "",
        },
      },
    },
  }
}

const saveLogCategorieDrupal = (data) => {
  fs.writeFile("../../data/writters/posts.json", data, (err) => {
    if (err) {
      return console.error("Error to create posts.json: ", err)
    }
    console.log("[OK] File posts.json created...")
  })
}

const deleteUsers = async () => {
  const usersDrupal = JSON.parse(
    fs.readFileSync("../../data/webflow/users.json", "utf8")
  )
  const users = usersDrupal.data
  const contentEditorUsers = users.filter((user) => {
    return (
      user.id != "0831f49b-dba3-4295-b146-b6cdbcbcd02a" &&
      user.id != "631689f5-1e1d-4b7c-8194-36870d194610" &&
      user.id != "8b8dc158-b899-417a-952d-c8dca6bc0943"
    )
  })

  const usersRequest = contentEditorUsers.map((userRequest) =>
    services.deleteUser(userRequest.id)
  )

  await Promise.all(usersRequest)
    .then((values) => ({ error: 0, values }))
    .catch((reason) => {
      console.log("reason: ", reason)
      return { error: 1, reason }
    })
}

// createCategorieDrupal()
//deleteUsers();

let generalData = []
const netxUrl = []

const checkExist = (item) => netxUrl.indexOf(item)

const getPots = async (_url = null) => {
  console.log("getPots: ", generalData.length)
  const data = await services.getPosts(url)

  if (data.statusAxios.status == 200) {
    generalData = [...generalData, ...data.data.data]
    const link = data.data.links.next?.href || null
    if (link && checkExist(link) < 0) {
      netxUrl.push(link)
      await getPots(link)
    }
  } else {
    console.log("Error: ", data.statusAxios)
  }

  saveLogCategorieDrupal(JSON.stringify(generalData))
}

const getDataWritter = async (user) => {
  try {
    const userData = await services.getWritterData(encodeURIComponent(user))
    if (userData.statusAxios.status == 200 && userData.data.data[0].id) {
      return userData.data.data[0].id
    }
    return null
  } catch (error) {
    return null
  }
}

const getArticleInfo = (article) => {
  let usersWebFlow

  try {
    usersWebFlow = fs.readFileSync(
      `../../data/ivn-archive/content/news_articles${article}.html`,
      "utf8"
    )
  } catch (error) {
    return null
  }

  let archivo = usersWebFlow.toString().split("\n")
  let author = archivo[4].split("-")[1].trim()

  try {
    usersWebFlow = fs.readFileSync(
      `../../data/ivn-archive/content/authors/${author}.html`,
      "utf8"
    )
  } catch (error) {}

  archivo = usersWebFlow.toString().split("\n")
  author = archivo[3].split("displayName: ")[1]?.trim()
  return author
}

let flag = 5
const updateData = async () => {
  while (flag < 500) {
    const autor = await getArticleInfo(posts[flag].attributes.path.alias)
    if (autor) {
      const uidUser = await getDataWritter(autor)
      if (uidUser) {
        const idArticle = posts[flag].id
        console.log({ uidUser, idArticle })
        const fg = await services.updatePost(idArticle, uidUser)
        console.log(fg)
      }
    }
    flag++
  }
}

updateData()
// getArticleInfo("/2008/11/03/unconventional-look-proposition-8")
