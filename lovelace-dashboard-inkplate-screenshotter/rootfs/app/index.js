const config = require("./config");
const path = require("path");
const http = require("http");
const https = require("https");
const { promises: fs } = require("fs");
const fsExtra = require("fs-extra");
const puppeteer = require("puppeteer");
const { CronJob } = require("cron");
const gm = require("gm"); //ImageMagick (not GraphicsMagick) - For manipulating the captured image


(async () => {
  if (config.pages.length === 0) {
    return console.error("Please check your configuration");
  }
  for (const i in config.pages) {
    const pageConfig = config.pages[i];
    if (pageConfig.rotation % 90 > 0) {
      return console.error(
        `Invalid rotation value for entry ${i + 1}: ${pageConfig.rotation}`
      );
    }
  }

  console.log("Starting browser client to snapshot image...");
  let browser = await puppeteer.launch({
    args: [
      "--disable-dev-shm-usage",
      "--no-sandbox",
      `--lang=${config.language}`,
      config.ignoreCertificateErrors && "--ignore-certificate-errors"
    ].filter((x) => x),
    headless: config.debug !== true
  });

  console.log(`Visiting '${config.baseUrl}' to login...`);
  let page = await browser.newPage();
  await page.goto(config.baseUrl, {
    timeout: config.renderingTimeout
  });

  const hassTokens = {
    hassUrl: config.baseUrl,
    access_token: config.accessToken,
    token_type: "Bearer"
  };

  console.log("Adding authentication entry to browser's local storage...");
  await page.evaluate(
    (hassTokens, selectedLanguage) => {
      localStorage.setItem("hassTokens", hassTokens);
      localStorage.setItem("selectedLanguage", selectedLanguage);
    },
    JSON.stringify(hassTokens),
    JSON.stringify(config.language)
  );

  page.close();

  if (config.debug) {
    console.log(
      "Debug mode active, will only render once in non-headless model and keep page open"
    );
    renderAndConvertAsync(browser);
  } else {
    console.log("Starting first render...");
    renderAndConvertAsync(browser);
    console.log("Starting rendering cronjob...");
    new CronJob({
      cronTime: config.cronJob,
      onTick: () => renderAndConvertAsync(browser),
      start: true
    });
  }

  const httpServer = http.createServer(async (request, response) => {
    // Parse the request
    const url = new URL(request.url, `http://${request.headers.host}`);

    // Get the filename -- Drop suffix/extension and drop leading /
    const imageNameNoExtension = url.pathname.replace(/\//g,"").replace(/.png/g,"");
    console.log(`imageNameNoExtension: ${imageNameNoExtension}`);


    //Allow access as 1.png or 2.png (or 3.bmp for that matter)
    //Default to the 1 if no path supplied
    let pageNumber =
      imageNameNoExtension === "" ? 1 : parseInt( imageNameNoExtension );
    //Also (if not a number), lookup the filename as whatever is configured for the URL's name. E.g. "inkplate10_image_a".png
    if (
      isFinite(pageNumber) === false ||
      pageNumber > config.pages.length ||
      pageNumber < 1
    ) {
        //Get the page/URL index of where that name is found in config.pages.name
        pageNumber = config.pages.findIndex(item => item['name'] === imageNameNoExtension);
        //console.log(`pageNumber found at index: ${pageNumber}`);
    }

    if (
      isFinite(pageNumber) === false ||
      pageNumber > config.pages.length ||
      pageNumber < 1
    ) {
      console.log(`Invalid request: ${request.url} for page ${pageNumber}`);
      response.writeHead(400);
      response.end("Invalid request");
      return;
    }
    try {
      // Log when the page was accessed
      const n = new Date();

      const pageIndex = pageNumber - 1;
      const configPage = config.pages[pageIndex];

      console.log(`${n.toISOString()}: Image ${pageNumber} was accessed - ${configPage.name}`);

      const data = await fs.readFile(configPage.outputPath);
      const stat = await fs.stat(configPage.outputPath);

      const lastModifiedTime = new Date(stat.mtime).toUTCString();

      response.writeHead(200, {
        "Content-Type": `image/png`,
        "Content-Length": Buffer.byteLength(data),
        "Last-Modified": lastModifiedTime
      });
      response.end(data);

    } catch (e) {
      console.error(e);
      response.writeHead(404);
      response.end("Image not found");
    }
  });

  const port = config.port || 5006;
  httpServer.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });
})();

async function renderAndConvertAsync(browser) {
  for (let pageIndex = 0; pageIndex < config.pages.length; pageIndex++) {
    const pageConfig = config.pages[pageIndex];

    const url = `${config.baseUrl}${pageConfig.screenShotUrl}`;

    const outputPath = pageConfig.outputPath;
    await fsExtra.ensureDir(path.dirname(outputPath));

    const tempPath = outputPath + ".temp." + "png";

    console.log(`Rendering ${url} to image at tempPath ${tempPath}...`);
    await renderUrlToImageAsync(browser, pageConfig, url, tempPath);

    console.log(`Converting rendered screenshot of ${url} to png at outputPath ${outputPath}...`);
    await convertImageToInkplateCompatiblePngAsync(
      pageConfig,
      tempPath,
      outputPath
    );

    fs.unlink(tempPath);
    console.log(`Finished ${url}`);
  }
}



async function renderUrlToImageAsync(browser, pageConfig, url, path) {
  let page;
  try {
    page = await browser.newPage();
      let size = {
      width: Number(pageConfig.renderingScreenSize.width),
      height: Number(pageConfig.renderingScreenSize.height)
    };

    if (pageConfig.rotation % 180 > 0) {
      size = {
        width: size.height,
        height: size.width
      };
    }

    await page.setViewport(size);
    const startTime = new Date().valueOf();
    await page.goto(url, {
      waitUntil: ["domcontentloaded", "load", "networkidle2"],
      timeout: config.renderingTimeout
    });

    console.log("Goto completed");

    const navigateTimespan = new Date().valueOf() - startTime;
    await page.waitForSelector("home-assistant", {
      timeout: Math.max(config.renderingTimeout - navigateTimespan, 1000)
    });

    console.log("Wait for selector completed");

    await page.addStyleTag({
      content: `
        body {
          width: calc(${size.width}px / ${pageConfig.scaling});
          height: calc(${size.height}px / ${pageConfig.scaling});
          transform-origin: 0 0;
          transform: scale(${pageConfig.scaling});
          overflow: hidden;
        }`
    });

    console.log("Added style tag");

    if (pageConfig.renderingDelay > 0) {
      await page.waitForTimeout(pageConfig.renderingDelay);
    }
    console.log("Wait for timeout completed");
    await page.screenshot({
      path,
      type: "png",
      clip: {
        x: 0,
        y: 0,
        ...size
      }
    });
    console.log("Screenshot completed");
  } catch (e) {
    console.error("Failed to render", e);
  } finally {
    if (config.debug === false) {
      await page.close();
    }
  }
}

function convertImageToInkplateCompatiblePngAsync(
  pageConfig,
  inputPath,
  outputPath
) {
  return new Promise((resolve, reject) => {
    gm(inputPath)
      .options({
        imageMagick: config.useImageMagick === true
      })
      .rotate("white", pageConfig.rotation)
      .setFormat("png")
      .type("TrueColor")
      .bitdepth(8)
      .quality(100)
      .write(outputPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}