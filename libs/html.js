const jsdom = require("jsdom");
const webflowServices = require("../services/webflowServices");
const drupalServices = require("../services/drupalFilesServices");
const { fileExt } = require("../libs/utils");
const { JSDOM } = jsdom;


const fillHtmlContentImages = async (html_content, idArticle) => {
  const { document } = new JSDOM(`...`).window;
  const articleBoby = document.createElement("div");
  articleBoby.innerHTML = html_content;
  const listFigures = articleBoby.getElementsByTagName("figure");

  for (let index = 0; index < listFigures.length; index++) {
    const figure = listFigures[index];
    const img = figure.firstElementChild.firstChild;
    const imgName = `${idArticle}_${index}${fileExt(img.src)}`;
    const imgBuffer = await webflowServices.downloadWebflowUrlImgBuffer(img.src);
    const statusUpload = await drupalServices.uploadImgDrupal(imgBuffer, imgName);

    if (statusUpload.r1 == 201 && statusUpload.r2 == 201) {
      img.src = `/sites/default/files/2022-08/${imgName}`;
    }
  }

  return articleBoby.outerHTML;
};
;

module.exports = {
  fillHtmlContentImages,
};
