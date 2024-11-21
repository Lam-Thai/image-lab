const path = require("path");
const { readdir } = require("fs");
const fs = require("fs/promises");
const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

const main = async () => {
  await IOhandler.unzip(zipFilePath, pathUnzipped);
  try {
    await fs.mkdir(pathProcessed, { recursive: true });
    const pngOnlyList = await IOhandler.readDir(pathUnzipped);
    for (const selectedPic of pngOnlyList) {
      await IOhandler.grayScale(selectedPic, pathProcessed);
    }
  } catch (err) {
    console.log("something went wrong", err);
  }
};

main();
