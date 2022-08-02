const btoa = require("btoa")
const urlApi = "https://dev-ivn.pantheonsite.io/"
const b64User = btoa("Samuel Pilay Muñoz:mbigdZGuVU5La8v")
const configHeader = {
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      Authorization: `Basic ${b64User}`,
    },
  };

module.exports = {
    urlApi,
    configHeader,
  };