const got = require("got");
const { urlApi } = require("./config");

const send = async (request) => {
  const res = await got({
    url: `${urlApi}jsonapi${request.url}`,
    method: request.method,
    headers: {
      Authorization: `Basic ${Buffer.from(
        "API:5CpEjbcwXCJ3e8f",
        "utf8"
      ).toString("base64")}`,
      ...request.headers,
    },
    body: request.data,
  });
  return res;
};


module.exports = {
    send,
};
