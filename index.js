var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mongoose = require('mongoose');
var multipart = require('connect-multiparty');
var router = express.Router();


var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var db = mongoose.connect("mongodb://127.0.0.1:27017/yuhao");

var blogSchema = mongoose.Schema({
	number: String,
	date: String,
	location: String,
	title: String,
	kind: String,
	content: String,
	img: String,
	good: String,
	description: String,
	comment: [],
});
var Blog = mongoose.model("blog",blogSchema);

var userSchema = mongoose.Schema({
	profile:String,
	good:String,
	comment:String,
});
var User = mongoose.model("user",userSchema);

var userController = {
	getUser: function(req,res,next){
		User.find().exec(function(err,docs){
			console.log("获取用户资料成功");
			return res.json(docs);
		});
	},
	updateUser: function(req,res,next){
		var condition = req.body.condition;
		var update = req.body.update;
		User.update(condition,{$set:update}).exec(function(err,docs){
			console.log('更新序号为' + condition + '的博客，更新内容为' + update);
			// return res.json(docs);
		});
		User.find().exec(function(err,docs){
			return res.json(docs);
		});
	},
}
var blogController = {

	// blogs

	getBlog: function(req,res,next){
		Blog.find().exec(function(err,docs){
			console.log("获取博客成功");
			return res.json(docs);
		});
	},
	getBlogByConditions: function(req,res,next){
		var condition = req.body;
		Blog.find(condition).exec(function(err,docs){
			console.log("获取"+condition+"博客成功");
			return res.json(docs);
		});
	},
	addBlog: function(req,res,next){
		var blog = new Blog(req.body);
		console.log(req.body);
		blog.save(function(err,docs){
			console.log(docs);
			return res.json(docs);
		});

	},
	deleteBlog: function(req,res,next){
		var condition = req.body;
		Blog.remove(condition,function(err,docs){
			console.log('删除序号为' + condition.number + "博客");
			return res.json(docs);
		});
	},
	updateBlog:function(req,res,next){
		var condition = req.body.condition;
		var update = req.body.update;
		Blog.update(condition,{$set:update}).exec(function(err,docs){
			console.log('更新序号为' + condition + '的博客，更新内容为' + update);
			// return res.json(docs);
		});

		Blog.find().exec(function(err,docs){
			return res.json(docs);
		});
	}


}
app.route('/getUser').get(userController.getUser);

app.route('/updateUser').post(userController.updateUser);

app.route('/getBlog').get(blogController.getBlog);

app.route('/getBlogByConditions').post(blogController.getBlogByConditions);

app.route('/addBlog').post(blogController.addBlog);

app.route('/deleteBlog').post(blogController.deleteBlog);

app.route('/updateBlog').post(blogController.updateBlog);
/***
curl -l -H "Content-type: application/json" -X POST -d '{"kind":"App"}' localhost:7000/updateBlog
**/

app.route('/uploadImg').post( multipart() ,function (req, res, next) {
  //  //获得文件名
  // var filename = req.files.files.originalFilename || path.basename(req.files.files.path);
  var filename = req.files.file.originalFilename;

  //复制文件到指定路径
  var targetPath = './dist/images/' + filename;

  // //复制文件流
  fs.createReadStream(req.files.file.path).pipe(fs.createWriteStream(targetPath));

  //响应ajax请求，告诉它图片传到哪了
  res.json({ code: 200, data: { url: '/images/' + filename } });
  // return res.json(req.files);

});


// 404
app.use(function(req, res, next){
	res.status(404);
	try{
		return res.json('404 not found');
	}catch(e){
		console.error('404 set header after sent');
	}
});
// 500
app.use(function(req, res, next){
	if(!err){return next()}
		res.status(500);
	try{
		return res.json(err.message || 'server.error');
	}catch(e){
		console.error('500 set header after sent');
	}
});


module.exports = app;