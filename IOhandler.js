const fs = require("fs/promises");
const PNG = require("pngjs").PNG;
const { createReadStream, createWriteStream } = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises");
const yauzl = require("yauzl-promise");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(pathIn);
  try {
    for await (const entry of zip) {
      // entry.filename = myfile.zip/file.png
      // entry.basename = file.png
      // path.basename(path/to/file) outputs the file
      const entryFile = path.basename(entry.filename);
      const destinationDir = path.join(pathOut, entryFile); // create name for the directory

      await fs.mkdir(pathOut, { recursive: true }); // making directory in zip
      const readStream = await entry.openReadStream();
      const writeStream = await createWriteStream(destinationDir);
      await pipeline(readStream, writeStream);
    }
  } finally {
    await zip.close();
  }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  try {
    const unzippedFileList = await fs.readdir(dir);
    const filteredUnzip = unzippedFileList.filter((picture) =>
      picture.endsWith(".png")
    );
    const filteredUnzip2 = filteredUnzip.filter(
      (picture) => !picture.startsWith(".")
    );
    const mapPathtoPic = filteredUnzip2.map((picture) =>
      path.join(dir, picture)
    );
    return mapPathtoPic;
  } catch (err) {
    console.error("something went wrong", err);
  }
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

const greyScaleMath = async (data, idx) => {
  let red = data[idx];
  let green = data[idx + 1];
  let blue = data[idx + 2];

  let gray = (red + green + blue) / 3;

  data[idx] = gray;
  data[idx + 1] = gray;
  data[idx + 2] = gray;

  return null;
};

const grayScale = (pathIn, pathOut) => {
  createReadStream(pathIn)
    .pipe(
      new PNG({
        filterType: 4,
      })
    )
    .on("parsed", function () {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          var idx = (this.width * y + x) << 2;

          greyScaleMath(this.data, idx);
        }
      }

      this.pack().pipe(
        createWriteStream(path.join(pathOut, path.basename(pathIn)))
      );
    });
};

module.exports = {
  unzip,
  readDir,
  grayScale,
};
