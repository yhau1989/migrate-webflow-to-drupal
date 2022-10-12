const fs = require("fs");
const arrayPaginate = require("array-paginate");
const services = require("../../services/categoriesServices");
const usersWebFlow = JSON.parse(
  fs.readFileSync("../../data/webflow/topics.json", "utf8")
);

const items = usersWebFlow.items;
const rowsPerPage = 50;
const totalsPages = arrayPaginate(items, 1, rowsPerPage).totalPages;
let datas = {};

async function createCategorieDrupal() {
  let currentPage = 1;
  let result = [];
  let results = []
  while (currentPage <= totalsPages) {
    datas = arrayPaginate(items, currentPage, rowsPerPage);
    result = await runCreations(datas);
    results = [...results, ...result];
    currentPage++;
  }
  await saveLogCategorieDrupal(JSON.stringify(results));
}

const runCreations = async (_dataCategories) => {
  const requests = _dataCategories.docs.map((categorie) =>
    services.createCategorie(createBodyDrupal(categorie), categorie)
  );

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


const createBodyDrupal = (itemWebFlow) => {
  return {
    data: {
      type: "taxonomy_term--categories",
      attributes: {
        // name: itemWebFlow.name.replace(/[^0-9a-z-A-Z ]/g, "").replace(/ +/, "").replace("  ", " ").trim(),
        name: itemWebFlow.name,
        description: {
          value: itemWebFlow.description || ""
        },
      },
    },
  };
};

const saveLogCategorieDrupal = (data) => {
  fs.writeFile("../../data/drupal/Categories/CategoriesDrupal.json", data, (err) => {
    if (err) {
      return console.error("Error to create CategoriesDrupal.json: ", err);
    }
    console.log("[OK] File CategoriesDrupal.json created...");
  });
};

const deleteUsers = async() => {
  const usersDrupal = JSON.parse(
    fs.readFileSync("../../data/webflow/users.json", "utf8")
  );
  const users = usersDrupal.data;
  const contentEditorUsers = users.filter(user => {
    return user.id != "0831f49b-dba3-4295-b146-b6cdbcbcd02a" && user.id != "631689f5-1e1d-4b7c-8194-36870d194610" && user.id != "8b8dc158-b899-417a-952d-c8dca6bc0943"
  })

  const usersRequest = contentEditorUsers.map(userRequest => services.deleteUser(userRequest.id))
  
  await Promise.all(usersRequest)
    .then((values) => ({ error: 0, values }))
    .catch((reason) => {
      console.log("reason: ", reason);
      return { error: 1, reason };
    });
}

createCategorieDrupal();
//deleteUsers();
