const gotServices = require(".gotServices");
const { FileResource, Resource } = require("drupal-jsonapi-client");

const uploadImgDrupal = async (bufferImge, imageName) => {
    const response1 = await gotServices.send(
      FileResource.New({
        type: "media--image",
        field: "field_media_image",
        file: bufferImge,
        fileName: imageName,
      })
    );
  
    const response2 = await gotServices.send(
      Resource.New({
        type: "media--image",
        data: {
          attributes: {
            name: `migrated-image-${imageName}`,
          },
          relationships: {
            field_media_image: {
              data: {
                type: "file--file",
                id: JSON.parse(response1.body).data.id,
              },
            },
          },
        },
      })
    );
  
    return {
      r1: response1.statusCode,
      r2: response2.statusCode,
      idR1: JSON.parse(response1.body).data.id,
      idR2: JSON.parse(response2.body).data.id,
    };
  };

  module.exports = {
    uploadImgDrupal,
  };
  