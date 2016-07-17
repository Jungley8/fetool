# fetool
基于nodejs和gulp搭建的前端自动化流程工具。

## 功能说明
fetool将前端开发人员日常工作整合起来，并提供浏览器多端实时预览功能，能够用于辅助团队规范开发，提高团队的工作效率。
* 创建项目
* html包含（include）
* js 语法检测
* css压缩、autoprefixer、less 预编译
* 图片压缩合并（雪碧图制作）
* 文件打包
* 页面实时自动更新
* 支持多项目开发

## 雪碧图制作方法

1. png原图放在 `[项目文件夹]/sprite/images/`
2. gulp sprite  -x [项目文件夹]
3. 在less文件中引用sprite.less `@import url(../sprite/sprite.less)`
4. 定义图片样式
```
.icon-email {
  .sprite(@icon-email);
}
/*
Example usage in HTML:

`display: block` sprite:
<div class="icon-home"></div>

To change `display` (e.g. `display: inline-block;`), we suggest using a common CSS class:

// CSS
.icon {
  display: inline-block;
}

// HTML
<i class="icon icon-home"></i>
*/
```

## 安装
```
git clone https://github.com/Jungley8/fetool.git
npm install -g gulp
npm install
```

## 命令
```
node schema.js                  //创建项目，拷贝常用文件到项目文件夹
gulp help                       //显示命令帮助说明
gulp -x [项目文件夹]            //默认命令
                                //启动browserSync Server
                                //监听css,js,html文件并实时更新
gulp images  -x [项目文件夹]    //压缩图片
gulp sprite  -x [项目文件夹]    //制作雪碧图
gulp build   -x [项目文件夹]    //整理模板文件
gulp rebuild -x [项目文件夹]    //重新生成所有页面
gulp zip     -x [项目文件夹]    //打包模板文件
```

## 文件目录体系
```
 当前目录/
│
├── dist/ (下列文件只做参考，不是必须)
│   ├── css/
│   │   └── jquery.fancybox.css
│   ├── js/
│   │   └── jquery-1.8.3.min.js
│   │   └── jquery.fancybox.pack.js
│
├── src/（下列文件只做参考，不是必须）
│   ├── css/
│   │   └── jquery.fancybox.css
│   ├── js/
│   │   └── jquery-1.8.3.min.js
│   │   └── jquery.fancybox.pack.js
│   ├── include/
│   │   └── header.html
│   │   └── meta.html
│   │   └── footer.html
│   └── index.html
│   │
├── [test]/（部分文件是创建项目时从上面目录拷贝而来）
│   ├── dist/
│   │   ├── css/
│   │   │   └── jquery.fancybox.css
│   │   ├── js/
│   │   │   └── jquery-1.8.3.min.js
│   │   │   └── jquery.fancybox.pack.js
│   ├── sprite/
│   │   ├── images/
│   │   │   └── home.png
│   │   │   └── love.png
│   ├── src/
│   │   ├── less/
│   │   │   └── test.less
│   │   ├── images/
│   │   │   └── banner.jpg
│   │   │   └── ……
│   │   ├── include/
│   │   │   └── header.html
│   │   │   └── meta.html
│   │   │   └── footer.html
│   │   ├── js/
│   │   │   └── common.js
│   │   └── index.html
│   │   └── test.html
> [test] 为 项目名称
```

## License
The MIT License(http://opensource.org/licenses/MIT)

请自由地享受和参与开源，欢迎fork，打造自己适合的开发环境。