const axios = require("axios").default;
const { urlApi, configHeader } = require("./config");

const createUser = async (data, webflowUser) => {
  return await axios
    .post(`${urlApi}jsonapi/user/user`, data, configHeader)
    .then((response) => {
      const { status, statusText } = response;
      return {
        webflowUser,
        drupalUser: response.data,
        error: 0,
        statusAxios: { status, statusText },
      };
    })
    .catch((error) => {
      return { webflowUser, drupalUser: null, error: 1, errorDetail: error };
    });
};

const deleteUser = async (idUser) => {
  return await axios
    .delete(`${urlApi}jsonapi/user/user/${idUser}`, {}, configHeader)
    .then((response) => {
      const { status, statusText } = response;
      return {
        error: 0,
        statusAxios: { status, statusText, response },
      };
    })
    .catch((error) => {
      return { error: 1, errorDetail: error, idUser };
    });
};

module.exports = {
  createUser,
  deleteUser,
};
