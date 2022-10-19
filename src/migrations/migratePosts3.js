const fs = require("fs")
const arrayPaginate = require("array-paginate")
const gotServices = require("../../services/gotServices")
const webflowServices = require("../../services/webflowServices")
const { fillHtmlContentImages } = require("../../libs/html")
const { withLeadingSlash, fileName, fileExt } = require("../../libs/utils")
const { Resource } = require("drupal-jsonapi-client")
const { buildEtl, getDataFromArticles } = require("./archive/readHtmlPost")

const {
  downloadWebflowUrlImgBuffer,
} = require("../../services/webflowServices")
const { uploadImgDrupal } = require("../../services/drupalFilesServices")

const usersIndexes = JSON.parse(
  fs.readFileSync(
    "../../data/ivn-archive/Users/index_archiveWritters_DrupalUser.json",
    "utf8"
  )
)

const resagados2010 = JSON.parse(
  fs.readFileSync("../../data/drupal/Posts_back/PostsDrupal2019.json", "utf8")
)

const getTime = () => {
  const d = new Date()
  const localTime = d.getTime()
  const localOffset = d.getTimezoneOffset() * 60000

  const utc = localTime + localOffset
  const offset = -5 // UTC of Dubai is +04.00
  const dubai = utc + 3600000 * offset

  const dubaiTimeNow = new Date(dubai).toISOString()
  return dubaiTimeNow
}

async function createPostsDrupal(postPool, year) {
  const rowsPerPage = 1
  const totalsPages = arrayPaginate(postPool, 1, rowsPerPage).totalPages
  let datas = {}
  let currentPage = 1
  let result = {}
  let results = []
  while (currentPage <= totalsPages) {
    datas = arrayPaginate(postPool, currentPage, rowsPerPage)
    result = await runCreations(datas)
    results = [...results, ...result]
    currentPage++
  }
  await saveLogPostsDrupal(JSON.stringify(results), year)
}

const runCreations = async (_dataPosts) => {
  const requests = _dataPosts.docs.map((post) => request(post))

  const runData = await Promise.all(requests)
    .then((values) => ({ error: 0, values }))
    .catch((reason) => {
      console.log("reason: ", reason)
      return { error: 1, reason }
    })

  if (runData.error == 0) {
    return runData.values
  }
  return []
}

const isBreakingNews = (post) => {
  if (post.publishedOn.includes("2022")) {
    return [
      {
        type: "taxonomy_term--categories",
        id: "f4b5fef2-5535-48cc-8dbb-bd0bd3d6e3c3",
      },
      // {
      //   type: "taxonomy_term--categories",
      //   id: postCategoriesIndexes[post.category],
      // },
    ]
  }
  return [
    {
      type: "taxonomy_term--categories",
      id: "f4b5fef2-5535-48cc-8dbb-bd0bd3d6e3c3",
      // id: postCategoriesIndexes[post.category],
    },
  ]
}

const request = async (post) => {
  let result = {}
  console.log(`request inicio: ${getTime()} - `, post.slug)
  try {
    console.log(`verifyPost inicio: ${getTime()}`)
    const alredyExist = await webflowServices.verifyPost(post.headline)
    console.log(`verifyPost fin: ${getTime()}`)
    if (alredyExist == 0) {
      try {
        console.log(`fillHtmlContentImages inicio: ${getTime()}`)
        const postBodyDrupal = await fillHtmlContentImages(
          post.articleBody,
          post.id
        )
        console.log(`fillHtmlContentImages fin: ${getTime()}`)
        console.log(`uuidHeroImage inicio: ${getTime()}`)
        const heroImg = await uuidHeroImage(post.id, post.featuredImage)
        console.log(`uuidHeroImage fin: ${getTime()}`)
        const setCtegories = isBreakingNews(post)
        console.log(`gotServices inicio: ${getTime()}`)
        const d = await gotServices.send(
          Resource.New({
            type: "node--article",
            data: {
              attributes: {
                title: post.headline,
                body: {
                  value: `${postBodyDrupal.html}`,
                  format: "full_html",
                },
                created: `${post.publishedOn.split("Z")[0]}+00:00`,
                path: { alias: `/${post.alias}` },
                moderation_state: "published",
              },
              relationships: {
                field_image: {
                  data: heroImg
                    ? {
                        type: "media--image",
                        id: heroImg,
                      }
                    : null,
                },
                field_category: {
                  data: setCtegories,
                },
                uid: {
                  data: {
                    type: "user--user",
                    id:
                      usersIndexes[post.author] ||
                      "0cb48e01-d69a-4178-bec0-1621cad5f328",
                  },
                },
              },
            },
          })
        )
        console.log(`gotServices fin: ${getTime()}`)
        result = {
          idWebFlow: post.id,
          alias: post.alias,
          statusRest: d.statusCode,
        }
      } catch (error2) {
        console.log(`gotServices catch fin: ${getTime()}`)
        result = {
          idWebFlow: post.id,
          alias: post.alias,
          statusRest: 999,
          error2,
        }
      }
    } else {
      result = {
        idWebFlow: post.id,
        alias: post.alias,
        statusRest: 900,
        error: "alredyExist",
      }
    }
  } catch (error) {
    console.log(`verifyPost catch fin: ${getTime()}`)
    result = {
      idWebFlow: post.id,
      alias: post.alias,
      statusRest: 901,
      error,
    }
  }
  console.log(`request fin: ${getTime()} - `, post.slug)
  console.log(result)
  return result
}

const uuidHeroImage = async (id, hero) => {
  const img = await downloadWebflowUrlImgBuffer(hero)
  const { idR2 } = await uploadImgDrupal(
    img,
    `hero-migrated-${id}${fileExt(hero)}`
  )
  return idR2
}

const saveLogPostsDrupal = (data, year) => {
  fs.writeFile(
    `../../data/drupal/Posts/PostsDrupal${year}.json`,
    data,
    (err) => {
      if (err) {
        return console.error("Error to create PostsDrupal.json: ", err)
      }
      console.log("[OK] File PostsDrupal.json created...")

      // fs.unlink("TopicsBq.json", (err2) => {
      //   if (err2) {
      //     return console.error("Error to delete file TopicsBq.json: ", err2);
      //   }
      //   console.log("[OK] File TopicsBq.json deleted...");
      // });
    }
  )
}

const saveLogPostsDrupal2 = (data) => {
  fs.writeFile(
    `../../data/drupal/Posts/Samo234.json`,
    JSON.stringify(data),
    (err) => {
      if (err) {
        return console.error("Error to create PostsDrupal.json: ", err)
      }
      console.log("[OK] File PostsDrupal.json created...")
    }
  )
}

// const yearRun = "2012"
// const articles = buildEtl()
// const a2008 = articles.filter((item) => item.year == yearRun)[0]
// console.log(JSON.stringify(a2008))
// const procesados = []
// let featuredImage = ""
// a2008.months.forEach((month) => {
//   month.days.forEach((day) => {
//     day.files.forEach(async (file) => {
//       console.log(`${a2008.year}/${month.month}/${day.day}/${file}`)
//       let dc = getDataFromArticles(
//         `${a2008.year}/${month.month}/${day.day}/${file}`
//       )
//       dc.alias = `${a2008.year}/${month.month}/${day.day}/${dc.slug}`
//       featuredImage = dc.featuredImage.split("cloudinary://")[1]?.trim()
//       console.log("featuredImage: ", featuredImage)
//       dc.featuredImage = `https://res.cloudinary.com/ivnnews-archive/image/upload/${featuredImage}.jpg`
//       procesados.push(dc)
//     })
//   })
// })

// console.log(procesados.length)
// createPostsDrupal(procesados, yearRun)

// const a2012 = articles.filter((item) => item.year == "2012")
// const a2012_06 = a2012[0].months.filter((item) => item.month == "06")
// const a2012_06_03 = a2012_06[0].days.filter((item) => item.day == "03")
// const esteEs = a2012_06_03[0].files.filter(
//   (item) => item == "wisconsin-recall-as-told-by-instagram.html"
// )

// const year = "2009"
// const month = "12"
// const day = "28"
// const article = "marijuana-legalization-and-federalism.html"
// const dc = getDataFromArticles(`${year}/${month}/${day}/${article}`)
// dc.alias = `${year}/${month}/${day}/${dc.slug}`
// dc.featuredImage = `https://res.cloudinary.com/ivnnews-archive/image/upload/${dc.featuredImage
//   .split("cloudinary://")[1]
//   .trim()}.jpg`

// console.log(dc)
// request(dc)

const fg = resagados2010.filter((item) => item.statusRest == 901)
console.log(fg.length)

async function run() {
  let dc = null
  for (let i = 0; i < fg.length; i++) {
    dc = await getDataFromArticles(`${fg[i].alias}.html`)
    dc.alias = fg[i].alias
    dc.featuredImage = `https://res.cloudinary.com/ivnnews-archive/image/upload/${dc.featuredImage
      .split("cloudinary://")[1]
      .trim()}.jpg`
    await request(dc)
  }
}

run()
