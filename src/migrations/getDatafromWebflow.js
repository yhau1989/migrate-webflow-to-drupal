const fs = require("fs");
const services = require("../../services/postServices");

const limitPerPage = 100;
const fullData = [];
const jsonDocument = [];

async function getData() {
  let currentPage = 0;
  let startRange = 0
  while (currentPage <= 11) {
    let g = await runCreations(startRange);
    fullData.push(g);
    currentPage++;
    startRange += 100;
  }
  await g();
  console.log('jsonDocument: ', jsonDocument.length);
  await saveJson(JSON.stringify(jsonDocument));
}

const runCreations = async (page) => {
  const runData = await services
    .getPostFromWebflow(page, limitPerPage)
    .then((values) => ({ error: 0, values }))
    .catch((reason) => {
      console.log("reason: ", reason);
      return { error: 1, reason };
    });

  if (runData.error == 0) {
    return runData.values;
  } else {
    console.error(`runCreations error: page${page} ,`, runData);
  }
  return null;
};

const addItems = (itemsData) => {
  const { items, error, statusAxios } = itemsData;
  if (error == 0) {
    items.forEach((element) => {
      let repeat = fullData.filter((item) => item._id == element._id);
      if (repeat.length <= 0) {
        fullData.push(element);
      }
      else {
        console.log('ya existe: ', element._id);
      }
    });
  } else {
    console.error('addItems: ', statusAxios);
  }
};


const g = () => {
  fullData.forEach(jsonItem => {
    const { items, error, statusAxios } = jsonItem;
    if(error == 0){
      items.forEach(x => {
        let c = jsonDocument.filter(f => f._id == x._id)
        if(c.length <= 0)
        {
          jsonDocument.push(x)
        }
        else
        {
          console.log('ya existe: ', x._id);
        }
      })
    }
    else {
      console.error('g: ', statusAxios);
    }
  })
}

const saveJson = (data) => {
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

getData();
