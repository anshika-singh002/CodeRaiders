// const fs = require("fs");
// const path = require("path");

// const dirCodes = path.join(__dirname, "codes");

// if(!fs.existsSync(dirCodes)){
//     fs.mkdirSync(dirCodes, { recursive:true }); //recursively creates directory
// }

// const generateFile = {format, content} => {
//     const jobID = uuid();
//     const filename = '${jobID}.${format}';
//     const filePath = path.join(dirCodes, filename); //generate file path
//     fs.writeFileSync(filePath,content);//generates file
//     return filePath;
// };

// module.exports = {generateFile};