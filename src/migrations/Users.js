const fs = require("fs");
const arrayPaginate = require("array-paginate");
const services = require("../../services/userServices");
const usersWebFlow = JSON.parse(
  fs.readFileSync("../../data/webflow/authors.json", "utf8")
);

const items = usersWebFlow.items;
const rowsPerPage = 50;
const totalsPages = arrayPaginate(items, 1, rowsPerPage).totalPages;
let datas = {};

// console.log('items: ', items.length);

async function createUsersDrupal() {
  let currentPage = 1;
  let result = [];
  let results = []
  while (currentPage <= totalsPages) {
    datas = arrayPaginate(items, currentPage, rowsPerPage);
    result = await runCreations(datas);
    results = [...results, ...result];
    currentPage++;
  }
  await saveLogUsersDrupal(JSON.stringify(results));
}

const runCreations = async (_dataUsers) => {
  const requests = _dataUsers.docs.map((user) =>
    services.createUser(createBodyUserDrupal(user), user)
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


const createBodyUserDrupal = (itemWebFlow) => {
  return {
    data: {
      type: "user--user",
      attributes: {
        mail: itemWebFlow["social-email-new"] || "",
        name: itemWebFlow.name.replace(/[^0-9a-z-A-Z ]/g, "").replace(/ +/, "").replace("  ", " ").trim(),
        pass: "123456",
        status: true,
        field_bio: {
          value: itemWebFlow.bio || "",
        },
      },
      relationships: {
        roles: {
          data: [
            {
              type: "user_role--user_role",
              id: "2503fd00-33f6-4442-9843-f779bd9d26f9",
              meta: {
                drupal_internal__target_id: "content_editor",
              },
            },
          ],
        },
      },
    },
  };
};

const saveLogUsersDrupal = (data) => {
  fs.writeFile("../../data/drupal/Users/UsersDrupal.json", data, (err) => {
    if (err) {
      return console.error("Error to create UsersDrupal.json: ", err);
    }
    console.log("[OK] File UsersDrupal.json created...");

    // fs.unlink("TopicsBq.json", (err2) => {
    //   if (err2) {
    //     return console.error("Error to delete file TopicsBq.json: ", err2);
    //   }
    //   console.log("[OK] File TopicsBq.json deleted...");
    // });
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

createUsersDrupal();
//deleteUsers();
