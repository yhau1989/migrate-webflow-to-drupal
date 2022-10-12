const fs = require("fs");
const arrayPaginate = require("array-paginate");
const gotServices = require("../../services/gotServices");
const { fillHtmlContentImages } = require("../../libs/html");
const { withLeadingSlash, fileName, fileExt } = require("../../libs/utils");
const { Resource } = require("drupal-jsonapi-client");
const {
  downloadWebflowUrlImgBuffer,
} = require("../../services/webflowServices");
const { uploadImgDrupal } = require("../../services/drupalFilesServices");

const postCategoriesIndexes = JSON.parse(
  fs.readFileSync(
    "../../data/drupal/Categories/index_WebflowCat_DrupalCat.json",
    "utf8"
  )
);

const usersIndexes = JSON.parse(
  fs.readFileSync(
    "../../data/drupal/Users/index_WebflowUser_DrupalUser.json",
    "utf8"
  )
);

const webFlowPosts = JSON.parse(
  fs.readFileSync("../../data/webflow/posts.json", "utf8")
);

// const reproceso = JSON.parse(
//   fs.readFileSync("../../data/drupal/Posts/PostsDrupal_step1.json", "utf8")
// );

// console.log('reproceso: ', reproceso.filter(x => x.statusRest == 999));

status999 = [
  
];



const post = webFlowPosts.filter((x) => status999.includes(x._id)); 
// console.log(post);
// const postWebflowData = {
//   publishDate: post["publish-date"],
//   body: post.body,
//   id: post._id,
//   title: post.name,
//   resume: post.teaser,
//   slug: post.slug,
//   category: post["topics-new"],
//   author: post["author-s"][0],
//   heroImage: post.hero,
//   media: post.media,
// };

const postPool = post.map((item) => ({
  publishDate: item["publish-date"],
  body: item.body,
  id: item._id,
  title: item.name,
  resume: item.teaser,
  slug: item.slug,
  category: item["topics-new"],
  author: item["author-s"][0],
  heroImage: item.hero,
  media: item.media,
}));

async function createPostsDrupal() {
  const rowsPerPage = 50;
  const totalsPages = arrayPaginate(postPool, 1, rowsPerPage).totalPages;
  let datas = {};
  let currentPage = 1;
  let result = {};
  let results = [];
  while (currentPage <= totalsPages) {
    datas = arrayPaginate(postPool, currentPage, rowsPerPage);
    result = await runCreations(datas);
    results = [...results, ...result];
    currentPage++;
  }
  await saveLogPostsDrupal(JSON.stringify(results));
}

const runCreations = async (_dataPosts) => {
  const requests = _dataPosts.docs.map((post) => request(post));

  const runData = await Promise.all(requests)
    .then((values) => ({ error: 0, values }))
    .catch((reason) => {
      console.log("reason: ", reason);
      return { error: 1, reason };
    });

  if (runData.error == 0) {
    // console.log(runData.values);
    return runData.values;
  }
  return [];
};

const isBreakingNews = (post) => {
  if (post.publishDate.includes("2022")) {
    return [
      {
        type: "taxonomy_term--categories",
        id: "f4b5fef2-5535-48cc-8dbb-bd0bd3d6e3c3",
      },
      {
        type: "taxonomy_term--categories",
        id: postCategoriesIndexes[post.category],
      },
    ];
  }
  return [
    {
      type: "taxonomy_term--categories",
      id: postCategoriesIndexes[post.category],
    },
  ];
};

const request = async (post) => {
  
  const postBodyDrupal = await fillHtmlContentImages(
    post.body,
    post.id,
    post.media
  );

  if (postBodyDrupal.error == 0) {
    const heroImg = await uuidHeroImage(post.id, post.heroImage);
    const setCtegories = isBreakingNews(post);
    const d = await gotServices.send(
      Resource.New({
        type: "node--article",
        data: {
          attributes: {
            title: post.title,
            body: {
              value: postBodyDrupal.html,
              format: "full_html",
              summary: post.summary,
            },
            created: `${post.publishDate.split(".000Z")[0]}+00:00`,
            path: { alias: withLeadingSlash(post.slug) },
            // status: true,
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
                id: usersIndexes[post.author],
              },
            },
          },
        },
      })
    );

    const result = { idWebFlow: post.id, statusRest: d.statusCode };
    console.log(result);
    return result;
  }

  const result = { idWebFlow: post.id, statusRest: 999};
  console.log(result);
  return result;
};

const uuidHeroImage = async (id, hero) => {
  const img = await downloadWebflowUrlImgBuffer(hero.url);
  const { idR2 } = await uploadImgDrupal(
    img,
    `hero-migrated-${id}${fileExt(hero.url)}`
  );
  return idR2;
};

const saveLogPostsDrupal = (data) => {
  fs.writeFile("../../data/drupal/Posts/PostsDrupal.json", data, (err) => {
    if (err) {
      return console.error("Error to create PostsDrupal.json: ", err);
    }
    console.log("[OK] File PostsDrupal.json created...");

    // fs.unlink("TopicsBq.json", (err2) => {
    //   if (err2) {
    //     return console.error("Error to delete file TopicsBq.json: ", err2);
    //   }
    //   console.log("[OK] File TopicsBq.json deleted...");
    // });
  });
};

// request(postWebflowData);
createPostsDrupal();
