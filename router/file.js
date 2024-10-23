const multer = require('multer');
const fs = require('fs');
var log4js = require('log4js')
const { errorResp, successResp } = require('../middleware/request')
const dataBase = require('../model/database')
const systemPath = require('path');
const { exec } = require('child_process')

const imagesDirectory = 'public';
const imageDir = '/' + imagesDirectory + '/';
let uploadedFileName;
const storageDisk = multer.diskStorage({
  destination: imagesDirectory,
  filename: function (req, file, callback) {
    fs.stat(imageDir + file.originalname, function (err, stat) {
      uploadedFileName = ''
      if (err == null) {
        uploadedFileName = Date.now() + '.' + file.originalname;
      } else if (err.code == 'ENOENT') {
        //获取最后一个.的位置
        const lastIndexOf = file.originalname.lastIndexOf(".");
        //获取文件的后缀名 .jpg
        const suffix = file.originalname.substring(lastIndexOf);
        uploadedFileName = String(Math.round((Math.random() * 10000) / 10)) + String(new Date().getTime()) + suffix;
      } else {
        console.log('Some other error: ', err.code);
      }
      callback(null, uploadedFileName)
    });
  }
})
const fileSize = 1024 * 1024 * 100
const upload = multer({ storage: storageDisk, limits: { fileSize: fileSize, files: 1 } })

/**
 * post /api/dogAdmin/upload
 * @summary 上传文件
 * @tags file
 * @description 上传文件
 * @security - Authorization
 */
async function uploadFile(req, resp) {
  file_logger().info('上传文件')
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const { type, path } = req.body
      if (!uploadedFileName) {
        return errorResp(resp, 400, 'error')
      }
      // 移动文件
      fs.rename(systemPath.join(__dirname, `../public/${uploadedFileName}`), systemPath.join(__dirname, `../public/${type}/${path}/${uploadedFileName}`), function (err) {
        if (err) {
          console.error('Error moving file:', err);
          return;
        }
      });
      let home_cover = ''
      if (type == 'video') {
        const inputPath = systemPath.join(__dirname, `../public/${type}/${path}/${uploadedFileName}`)
        const lastIndexOf = uploadedFileName.lastIndexOf(".");
        //获取文件的后缀名 .jpg
        const prefix = uploadedFileName.substring(0, lastIndexOf);
        const cover = systemPath.join(__dirname, `../public/image/cover/${prefix}.jpg`)
        home_cover = `/image/cover/${uploadedFileName}`
        exec(`ffmpeg -i ${inputPath} -ss 00:00:01 -vframes 1 ${cover}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`执行的错误: ${error}`);
            return;
          }
        })
      }
      return successResp(resp, { fileUrl: `/${type}/${path}/${uploadedFileName}`, home_cover: home_cover }, 'success')
    })
  } catch (error) {
    file_logger().error('上传文件失败', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

//----------------------------- private method --------------
// 配置日志输出
function file_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/file/file',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  var logger = log4js.getLogger('file')
  return logger
}

module.exports = {
  uploadFile,
  upload,
}