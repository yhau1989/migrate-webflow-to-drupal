const axios = require("axios").default;
const { urlApi, configHeader } = require("./config");

const createCategorie = async (data, webflowCategorie) => {
  return await axios
    .post(`${urlApi}jsonapi/taxonomy_term/categories`, data, configHeader)
    .then((response) => {
      const { status, statusText } = response;
      return {
        webflowCategorie,
        drupalCategorie: response.data,
        error: 0,
        statusAxios: { status, statusText },
      };
    })
    .catch((error) => {
      return { webflowCategorie, drupalCategorie: null, error: 1, errorDetail: error };
    });
};



module.exports = {
  createCategorie,
};
