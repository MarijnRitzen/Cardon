const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  var url = req.url;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`The url is: ${hostname}:${port}/${url}`);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});