

function getPagesConfig() {
  const pages = [];

  const pagesEnv = process.env[`PAGES`];
  //Regex is eqivalent to replaceAll
  const validJsonPages = "[" + pagesEnv.replace(/\n/g,",") + "]"

  console.log(`Pages... '${validJsonPages}'...`);

  jsonPages = JSON.parse( validJsonPages );


  for(let i = 0; i < jsonPages.length; i++) {
    let obj = jsonPages[i];

    const screenShotUrl = obj.path;
    const name = obj.name;
    const rotation = obj.rotation;
    const config = obj.config;

    let height = -1;
    let width = -1;
    switch(config) {
      case "inkplate6color":
        height = 448;
        width = 600;
        break;
      case "inkplate10":
        height = 1024
        width = 758;
        break;
        case "inkplate2":
          height = 104
          width = 212;
          break;
      default:
        break;
    }

    pages.push({
      screenShotUrl: screenShotUrl,
      name: name,
      outputPath: `output/${name}.png`,
      renderingDelay: process.env.RENDERING_DELAY,
      renderingScreenSize: {
        height: height,
        width: width,
      },
      rotation: rotation,
    });
  }

  return pages;
}

module.exports = {
  baseUrl: process.env.HA_BASE_URL,
  accessToken: process.env.HA_ACCESS_TOKEN,
  cronJob: process.env.CRON_JOB || "* * * * *",
  useImageMagick: process.env.USE_IMAGE_MAGICK === "true",
  pages: getPagesConfig(),
  port: process.env.PORT || 5006,
  renderingTimeout: process.env.RENDERING_TIMEOUT || 10000,
  language: process.env.LANGUAGE || "en",
  debug: process.env.DEBUG === "true",
  ignoreCertificateErrors:
    process.env.UNSAFE_IGNORE_CERTIFICATE_ERRORS === "true",
};