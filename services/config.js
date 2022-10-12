const btoa = require("btoa");
const urlApi = "https://dev-ivn.pantheonsite.io/";
const b64User = btoa("API:5CpEjbcwXCJ3e8f");
//  const b64User = btoa("Samuel Pilay Muñoz:mbigdZGuVU5La8v");


const configHeader = {
  headers: {
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json",
    Authorization: `Basic ${b64User}`,
  },
};

// use to upload images on Drupal jsonApi
const configHeaderImage = (fileName) => ({
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `file; filename="${fileName}"`,
    Authorization: `Basic ${b64User}`,
  }
});


//use to get data from webflow api
const configHeaderGetWebFlow = {
  headers: {
    Authorization:
      "Bearer 7518f79083929f1abc4838d656cfd5234b4920fe23d3c679a62631b598c5cc38",
  },
};

module.exports = {
  urlApi,
  configHeader,
  configHeaderGetWebFlow,
  configHeaderImage,
};
