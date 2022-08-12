const axios = require("axios").default;
const { configHeaderGetWebFlow } = require("./config");

const getPostFromWebflow = async (offset, limit) => {
  return await axios
    .get(`https://api.webflow.com/collections/5c9127dc8de2c93b785f8e8c/items?offset=${offset}&limit=${limit}`, configHeaderGetWebFlow)
    .then((response) => {
      const { status, statusText } = response;
      return {
        items: response.data.items,
        error: 0,
        statusAxios: { status, statusText },
      };
    })
    .catch((error) => {
      return { items: null, error: 1, errorDetail: error };
    });
};


const downloadWebflowUrlImgBuffer = async(urlImgWebfow) => {
  const response = await axios.get(urlImgWebfow, { responseType: 'arraybuffer'});
  return response.data;
}


module.exports = {
  getPostFromWebflow,
  downloadWebflowUrlImgBuffer
};
