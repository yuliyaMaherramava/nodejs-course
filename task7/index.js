const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const { pipeline } = require("stream");
const { promisify } = require("util");

const pipe = promisify(pipeline);
const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);

const isDateBefore = (date1, date2) => new Date(date1) < new Date(date2);

const createArchiveFile = async (fileName) => {
  try {
    const gzip = zlib.createGzip();
    const source = fs.createReadStream(fileName);
    const destination = fs.createWriteStream(`${fileName}.gz`);
    await pipe(source, gzip, destination);
  } catch (err) {
    console.error(`Error creating arhive file "${file}":`, error);
  }
};

const processFile = async (file, pathToFolder, fileList) => {
  try {
    console.log("-------------------------------------------");
    console.log("Scanning file:", file);

    const fullFileName = path.join(pathToFolder, file);
    const stats = await statAsync(fullFileName);

    console.log("Checking if the file is a directory...");
    if (stats.isDirectory()) {
      console.log(
        `The file "${file}" is a directory. Processing its contents...`
      );
      await processFolder(fullFileName);
      return;
    }

    console.log("Checking if the file is an archive...");
    if (file.includes(".gz")) {
      console.log("File is an archive. Omitting it...");
      return;
    }

    console.log("Checking for existing archive file...");
    const archiveFileName = `${file}.gz`;
    const archiveFullFileName = path.join(pathToFolder, archiveFileName);

    if (fileList.includes(archiveFileName)) {
      console.log("Archive file already exists. Checking its relevance...");
      const archiveStats = await statAsync(archiveFullFileName);

      if (isDateBefore(stats.mtime, archiveStats.mtime)) {
        console.log("The archive file is up to date.");
      } else {
        console.log("The archive file is outdated. Updating it...");
        await createArchiveFile(fullFileName);
        console.log("Archive file created.");
      }
    } else {
      console.log("No archive file found. Creating a new one...");
      await createArchiveFile(fullFileName);
      console.log("Archive file created.");
    }
  } catch (error) {
    console.error(`Error processing file "${file}":`, error);
  }
};

const processFolder = async (folderPath) => {
  try {
    console.log("Processing folder:", folderPath);
    const fileList = await readdirAsync(folderPath);

    for (const file of fileList) {
      await processFile(file, folderPath, fileList);
    }
  } catch (error) {
    console.error(`Error processing folder "${folderPath}":`, error);
  }
};

const main = async () => {
  try {
    const pathToFolder = process.argv[2];

    if (!pathToFolder) {
      throw new Error("No path to folder.");
    }

    console.log("Path to folder:", pathToFolder);

    await processFolder(pathToFolder);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exitCode = 1;
  }
};

main();
