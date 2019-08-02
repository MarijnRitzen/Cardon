const express = require('express');
const fs = require('fs');
const _ = require('underscore');
//var wkhtmltopdf = require('wkhtmltopdf');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('views'))

let jsondata = fs.readFileSync('views/names.json');
let jsonobj = JSON.parse(jsondata);

app.get('/', function(_req, res){
    res.render('index.html');
});

app.get('/submit', function(_req, res){
  let name1 = _req.query.name1.trim()
    , name2 = _req.query.name2.trim();
  var obj = new function(){
    this.source = name1;
    this.target = name2;
  }

  jsonobj.links.push(obj);
  
  fs.writeFile('views/names.json', JSON.stringify(jsonobj), 'utf8', callback);

  function callback(err) {
    if (err) {console.log('error'+ err);} 
  }
  res.redirect('/');
});

app.get('/remove', function(_req, res){
  let name1 = _req.query.name1.trim()
    , name2 = _req.query.name2.trim();

  jsonobj.links = _.without(jsonobj.links, _.findWhere(jsonobj.links, {
    source: name1,
    target: name2
  }));
  
  jsonobj.links = _.without(jsonobj.links, _.findWhere(jsonobj.links, {
    source: name2,
    target: name1
  }));

  fs.writeFile('views/names.json', JSON.stringify(jsonobj), 'utf8', callback);

  function callback(err) {
    if (err) {console.log('error'+ err);} 
  }
  res.redirect('/');
});

/*app.post('/pdf', (req, res) => { 
  res.set('Content-Disposition','attachment;filename=pdffile.pdf')
  res.set('Content-Type', 'application/pdf');
  wkhtmltopdf.command='<program_files>/wkhtmltopdf/bin/wkhtmltopdf';
  wkhtmltopdf(req.body.svg, {}, (err, stream) => {
    stream.pipe(res); 
  }); 
 })*/

app.listen(app.get('port'), function() {
});