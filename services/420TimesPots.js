const axios = require("axios").default
const { urlApi, configHeader } = require("./config")

const getPosts = async (url) => {
  return await axios
    .get(`${url}jsonapi/taxonomy_term/categories`)
    .then((response) => {
      const { status, statusText } = response
      return {
        data: response.data,
        error: 0,
        statusAxios: { status, statusText },
      }
    })
    .catch((error) => {
      return { error: 1, errorDetail: error }
    })
}

const getWritterData = async (user) => {
  return await axios
    .get(`${urlApi}jsonapi/user/user?filter[name]=${user}`)
    .then((response) => {
      const { status, statusText } = response
      return {
        data: response.data,
        error: 0,
        statusAxios: { status, statusText },
      }
    })
    .catch((error) => {
      return { error: 1, errorDetail: error }
    })
}

const updatePost = async (idPost, uidUser) => {
  const config = {
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      Authorization: "Basic QVBJOjVDcEVqYmN3WENKM2U4Zg==",
      "X-CSRF-Token": "xHrWTIyvSnmbbPkQZEHgYAcUVmh6oYLkt4TD7MFO-0k",
    },
  }

  const data = {
    data: {
      type: "node--article",
      id: idPost,
      relationships: {
        uid: {
          data: {
            type: "user--user",
            id: uidUser,
          },
        },
      },
    },
  }
  return await axios
    .patch(`https://cms.ivn.us/jsonapi/node/article/${idPost}`, data, config)
    .then((response) => {
      const { status, statusText } = response
      return {
        data: response.data,
        error: 0,
        statusAxios: { status, statusText },
      }
    })
    .catch((error) => {
      return { error: 1, errorDetail: error }
    })
}

module.exports = {
  getPosts,
  getWritterData,
  updatePost,
}
