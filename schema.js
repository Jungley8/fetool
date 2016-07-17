'use strict';

// generate schema:

var fs = require('fs'),
  readline = require('readline'),
  gulp = require('gulp'),
  copy = require('gulp-copy'),

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateConfig(name, pkgname, host, user, pass, port) {
  var output = '{';
  output += '\n\t"name":"' + name + '",';
  output += '\n\t"pkgname":"' + pkgname + '"';
  output += '\n}';
  if (!fs.existsSync(name)) {
    fs.mkdirSync(name);
    fs.writeFileSync(name + '/config.json', output);
    console.log('项目创建成功\n');
    gulp.src('./src/**')
      .pipe(copy(name));
    gulp.src('./dist/**')
      .pipe(copy(name));
  }
}

console.log('请输入项目目录及名称:\n');

rl.question('name: ', function(name) {
  rl.question('pkgname: ', function(pkgname) {
    rl.close();
    generateConfig(name, pkgname);
  })
});