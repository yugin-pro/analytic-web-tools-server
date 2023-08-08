import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";
import ejs from "ejs";

const APPS_PATH = path.join('C:\\Projects\\apps-dist\\');
const PORT = 3000;

// maps file extention to MIME types
// full list can be found here: https://www.freeformatter.com/mime-types-list.html
const MIME_TYPES = {
  'ico': 'image/x-icon',
  'html': 'text/html',
  'js': 'text/javascript',
  'json': 'application/json',
  'css': 'text/css',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'wav': 'audio/wav',
  'mp3': 'audio/mpeg',
  'svg': 'image/svg+xml',
  'pdf': 'application/pdf',
  'zip': 'application/zip',
  'doc': 'application/msword',
  'eot': 'application/vnd.ms-fontobject',
  'ttf': 'application/x-font-ttf',
  'default': 'text/plain',
};


const toBool = [() => true, () => false];

const prepareFile = async (url) => {
  const paths = [APPS_PATH, url];
  if (url.endsWith("/")) paths.push("index.html");
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(APPS_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : APPS_PATH + "/404.html";
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream, filePath };
};

http
  .createServer(async (req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`); 
    const file = await prepareFile(reqUrl.pathname);
    const statusCode = file.found ? 200 : 404;
    const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
    if (reqUrl.pathname === '/') {
      let data = {}
      data.apps = await getApps()
      let html = await ejs.renderFile(file.filePath, data)
      res.writeHead(200, { 'Content-Type': MIME_TYPES.html });
      res.end(html);
    }
    res.writeHead(statusCode, { "Content-Type": mimeType });
    file.stream.pipe(res);
    console.log(`${req.method} ${req.url} ${statusCode}`);
  })
  .listen(PORT);

async function getApps() {
  return [
    {url:'/decodeurl/', name:'URL Decode', description:'URL Decode is the online tool for decoding URL. Converter allows you to decode a URL revealing special characters contained in it by one click',logo:'/decodeurl/logo.png', likes:10},
//    {url:'/decodeurl/', name:'decodeurl', description:'encode and decode text with special signes',logo:'/decodeurl/logo.png', likes:6},
//    {url:'/decodeurl/', name:'decodeurl', description:'encode and decode text with special signes',logo:'/decodeurl/logo.png', likes:45},
  ]
}