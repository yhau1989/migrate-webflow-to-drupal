const fileExt = (url) => {
  return url.slice(url.lastIndexOf("."));
};

const fileName = (url) => {
  return url.slice(url.lastIndexOf("/")).split("/")[1];
};

module.exports = {
  fileExt,
  fileName,
};
