const fileExt = (url) => {
  return url.slice(url.lastIndexOf("."));
};

const fileName = (url) => {
  return url.slice(url.lastIndexOf("/")).split("/")[1];
};

const withLeadingSlash = (str) => {
  if (str.startsWith('/')) return str
  else return `/${str}`
}

module.exports = {
  fileExt,
  fileName,
  withLeadingSlash,
};
