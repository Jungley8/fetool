'use strict';

var path = require('path');
var fs = require('fs');
var yargs = require('yargs').argv;
var gulp = require('gulp');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var tap = require('gulp-tap');
var nano = require('gulp-cssnano');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var imagemin = require('gulp-imagemin'); //图片压缩
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var copy = require('gulp-copy');
var zip = require('gulp-zip');
var changed = require('gulp-changed'); // 只编译修改过的文件，加快速度
var merge = require('merge-stream');
var spritesmith = require('gulp.spritesmith'); //雪碧图插件

var name = '',//项目名称
  paths = '',//项目文件路径
  option = '',//配置项
  dist = '',//编译后文件
  build = '',//整理后文件
  pkgname = '',//项目完整名称
  pkg = require('./package.json'),
  url = ' ';//公司网站地址


function handleError(e) {
  gutil.beep(); // 控制台发声,错误时beep一下
  gutil.log(e);
}

gulp.task('default', ['init', 'styles', 'js', 'html'], function() {
  gulp.start('help');
  gulp.start('server');
  gulp.start('watch');
});

// 初始化项目配置
gulp.task('init', function() {
  if(!yargs.x){
    console.log('请输入项目参数！');
    return false;
  }
  if (yargs.x) {
    name = yargs.x;
    if (!fs.existsSync(name)) {
      console.log('找不到该项目，请输入 node schema 命令，初始化项目');
      return false;
    }
    if (!fs.existsSync(name + '/config.json')) {
      console.log('不存在该项目配置文件，请重新配置');
      return false;
    }
    var project = require('./' + name + '/config.json');//项目配置文件
    pkgname = project.pkgname;
    console.log('当前项目：' + pkgname + ' (' + name + ')');
  }

  paths = {
    js: [name + '/src/js/*.js'],// js 源文件路径
    less: [name + '/src/css/*.less'],//less 源文件路径
    html: [name + '/src/*.html'],// html 文件路径
    htmlSrc: [name + '/src/*.html', name + '/src/include/*.html'], // html 文件路径（包含公共文件）
    sprite: [name + '/sprite/images/*.png'],// 雪碧图原图路径
    sprite2x: [name + '/sprite/images/*@2x.png'],// 2倍图雪碧图原图路径
    images: [name + '/src/images/**/*.?(png|jpg|gif)'],//原图路径
  };
  option = {
    base: name + '/src'
  };
  dist = name + '/dist';
  build = name + '/build';
})

gulp.task('help', function() {
  console.log('**********************************************************************');
  console.log("\n");
  console.log('node schema.js     创建项目');
  console.log('gulp -x 项目文件夹 默认命令\n                   启动browserSync Server\n                   监听css,js,html文件并实时更新');
  console.log('gulp help          显示命令帮助说明');
  console.log('gulp images        压缩图片');
  console.log('gulp sprite        制作雪碧图');
  console.log('gulp build         整理模板文件');
  console.log('gulp rebuild       重新生成所有页面');
  console.log('gulp zip           打包模板文件');
  console.log("\n");
  console.log('**********************************************************************')
});

// js 语法检测
gulp.task('js', function() {
  return gulp.src(paths.js, option)
    .pipe(plumber())
    .pipe(changed(dist, {
      extension: '.js'
    }))
    .pipe(uglify().on('error', function(e) {
      handleError(e);
      this.emit('end');
    }))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// 更新 css css\autoprefixer
gulp.task('styles', function() {
  var banner = [
    '/*!',
    ' * <%= pkgname %>',
    ' * @Author <%= url %> <%= pkg.author %>.',
    ' * @Copyright <%= new Date().getFullYear() %>',
    ' */',
    ''
  ].join('\n');
  return gulp.src(paths.less, option)
    .pipe(plumber())
    .pipe(less().on('error', function(e) {
      handleError(e);
      this.emit('end');
    }))
    .pipe(header(banner, {
      pkg: pkg,
      url: url,
      pkgname: pkgname
    }))
    .pipe(autoprefixer({
      browsers: ['> 0.5%', 'Chrome > 4', 'IE >= 6', 'Firefox > 2', 'iOS > 7'],// 尽可能兼容更多低版本，根据需要配置
    }))
    .pipe(nano())
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// 更新html
gulp.task('html', function() {
  return gulp.src(paths.html, option)
    .pipe(plumber())
    .pipe(changed(dist, {
      extension: '.html'
    }))
    .pipe(tap(function(file) {
      var dir = path.dirname(file.path);
      var contents = file.contents.toString();
      contents = contents.replace(/<!-- #include file="(.*)" -->/gi, function(match, $1) {
        var filename = path.join(dir, $1);
        var content = fs.readFileSync(filename, 'utf-8');
        return '\n<!-- ' + $1 + ' -->\n' + content + '<!-- ' + $1 + ' end -->\n';
      });
      file.contents = new Buffer(contents);// 包含文件
    }))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// 重新生成所有html
gulp.task('rebuild', ['init'], function() {
  return gulp.src(paths.html, option)
    .pipe(plumber())
    .pipe(tap(function(file) {
      var dir = path.dirname(file.path);
      var contents = file.contents.toString();
      contents = contents.replace(/<!-- #include file="(.*)" -->/gi, function(match, $1) {
        var filename = path.join(dir, $1);
        var content = fs.readFileSync(filename, 'utf-8');
        return '\n' + content + '\n';
      });
      file.contents = new Buffer(contents);
    }))
    .pipe(gulp.dest(dist))
});

// 图片压缩
gulp.task('images', ['init'], function() {
  return gulp.src(paths.images, option)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(dist));
});

// 文件监听
gulp.task('watch', function() {
  gulp.watch(paths.less, ['styles']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.htmlSrc, ['html']);
});

// 服务器
gulp.task('server', function() {
  yargs.p = yargs.p || 8080;
  browserSync.init({
    server: {
      baseDir: name + '/dist'
    },
    ui: {
      port: yargs.p + 1,
      weinre: {
        port: yargs.p + 2
      }
    },
    port: yargs.p,
    startPath: '/'
  });
});

// build 项目
gulp.task('build', ['init'], function() {
  gulp.src(name + '/src/**/*.html')
    .pipe(gulp.dest(build));
  //CSS文件
  gulp.src(name + '/dist/css/**')
    .pipe(gulp.dest(build + '/css'));
  // 图片文件
  gulp.src(name + '/dist/images/**')
    .pipe(gulp.dest(build + '/images'));
  //压缩后的js文件
  gulp.src(name + '/dist/js/**')
    .pipe(gulp.dest(build + '/js'));
});

//打包主体build 文件夹并按照时间重命名
gulp.task('zip', ['init'], function() {
  function checkTime(i) {
    if (i < 10) {
      i = "0" + i
    }
    return i
  }

  var d = new Date();
  var year = d.getFullYear();
  var month = checkTime(d.getMonth() + 1);
  var day = checkTime(d.getDate());
  var hour = checkTime(d.getHours());
  var minute = checkTime(d.getMinutes());

  return gulp.src(name + '/build/**')
    .pipe(zip(name + '-' + year + month + day + hour + minute + '.zip'))
    .pipe(gulp.dest('./'));
});

// 制作雪碧图
gulp.task('sprite', ['init'], function() {
  // Generate our spritesheet
  var spriteData = gulp.src(paths.sprite).pipe(spritesmith({
    imgName: 'images/sprite.png',
    cssName: "sprite/sprite.less",
    // retinaImgName: 'images/sprite@2x.png',
    // retinaSrcFilter: paths.sprite2x,
    // padding: 20 // Exaggerated for visibility, normal usage is 1 or 2
    // algorithm: 'alt-diagonal' //可选
  }));

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe(gulp.dest(name + '/dist/'));

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    .pipe(gulp.dest(name + '/src/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});