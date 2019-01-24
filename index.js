var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mongoose = require('mongoose');
var multipart = require('connect-multiparty');
var router = express.Router();

var http = require('http');
var cheerio = require('cheerio');
//爬虫
var request = require('request');
var moment = require('moment');



var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//allow custom header and CORS
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200); /让options请求快速返回/
  }
  else {
    next();
  }
});

var db = mongoose.connect("mongodb://127.0.0.1:27017/wpserver");

// function post() {
// 	var postData = {
//         	"lat":"31.333467",
//         	"lon":"104.862946",
//         	"token":"1b89050d9f64191d494c806f78e8ea36"
//         };
//   	var clientServerOptions = {
//         url: 'http://aliv8.data.moji.com/whapi/json/aliweather/forecast24hours',
//         body: JSON.stringify(postData),
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization':'APPCODE 9a4b7288c78c4da9a68d72e8a916b762',
//         }
//     }
//     request(clientServerOptions, function (error, response) {
//         console.log(response);
//         return;
//     });

// }


// function postA() {
// 	var postData = {
//         	"num":"777",
//         };
//         console.log(JSON.stringify(postData));
//   	var clientServerOptions = {
//         url: 'http://47.52.132.146/addData',
//         body: JSON.stringify(postData),
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         }
//     }
//     request(clientServerOptions, function (error, response) {
//         console.log(response.body);
//         return;
//     });

// }


var dataController = {
	getData: function(req,res,next){
		var clientServerOptions = {
	        url: 'https://api.seniverse.com/v3/weather/now.json?key=5dj6pbdppzrc72kp&location=mianyang&language=zh-Hans&unit=c',
	        method: 'GET',
	    }
	    request(clientServerOptions, function (error, response) {
	        var data = JSON.parse(response.body);
	        var data2 = data.results[0];
	        var instant_data = {
				location: data2.location.name,
				weather: data2.now.text,
				temp: data2.now.temperature,
				feel: data2.now.feels_like,
				pressure: data2.now.pressure,
				humidity: data2.now.humidity,
				visibility: data2.now.visibility,
				wind_direction: data2.now.wind_direction,
				wind_direction_degree: data2.now.wind_direction_degree,
				wind_speed: data2.now.wind_speed,
				wind_scale: data2.now.wind_scale,
				update_time: data2.last_update,
			}
	        console.log(instant_data);
	        return res.json(instant_data);
	    });

		
	}
}

var expertSchema = mongoose.Schema({
	user_icon: String,
	username: String,
	post_time: String,
	title: String,
	description: String,
	image: String,
	expert_name: String,
	expert_icon: String,
	reply_time: String,
	reply: String,
});
var Expert = mongoose.model("expert", expertSchema);

var expertController = {
	getExpert: function(req,res,next){
		Expert.find().exec(function(err,docs){
			console.log("获取用户资料成功");
			return res.json(docs);
		});
	},
	addExpert: function(req,res,next){
		var expert = new Expert(req.body);
		console.log(req.body);
		expert.save(function(err,docs){
			console.log(docs);
			return res.json(docs);
		});
	}
};

// POST curl localhost:7000/addExpert -X POST -H "Content-Type:application/json" -d '{"username":"种植户甲","post_time":"2019.1.24","title":"我家藤椒遇到了大规模锈病","description":"我家的藤椒在9月份的时候，不知道怎么回事最近就得了锈病了，叶子上全是锈斑，专家可以解答一下吗?","expert_name":"专家乙","reply_time":"2019.1.27","reply":"建议你在种植的时候预防锈病，不要让土壤水分太高。另外9月份本来就是锈病高爆发的时期，所以希望在这个时间段可以做好心里准备来应对灾害"}'


// ====


// var blogSchema = mongoose.Schema({
// 	number: String,
// 	date: String,
// 	location: String,
// 	title: String,
// 	kind: String,
// 	content: String,
// 	img: String,
// 	good: String,
// 	description: String,
// 	comment: [],
// });
// var Blog = mongoose.model("blog",blogSchema);

var userSchema = mongoose.Schema({
	username: String,
	image: String,
	phone:String,
	location: String,
	peppernum: String,
	auth: String,
});
var User = mongoose.model("user",userSchema);

var userController = {
	addUser: function(req,res,next){
		var user = new User(req.body);
		console.log(req.body);
		user.save(function(err,docs){
			console.log(docs);
			return res.json(docs);
		});
	},
	getUser: function(req,res,next){
		User.find().exec(function(err,docs){
			console.log("获取用户资料成功");
			return res.json(docs);
		});
	},
	updateUser: function(req,res,next){
		var condition = req.body.condition;// username 
		var update = req.body.update;
		User.update(condition,{$set:update}).exec(function(err,docs){
			console.log('更新用户名为' + condition + '个人信息，更新信息为' + update);
			// return res.json(docs);
		});
		User.find().exec(function(err,docs){
			return res.json(docs);
		});
	},
}

// var blogController = {

// 	// blogs

// 	getBlog: function(req,res,next){
// 		Blog.find().exec(function(err,docs){
// 			console.log("获取博客成功");
// 			return res.json(docs);
// 		});
// 	},
// 	getBlogByConditions: function(req,res,next){
// 		var condition = req.body;
// 		Blog.find(condition).exec(function(err,docs){
// 			console.log("获取"+condition+"博客成功");
// 			return res.json(docs);
// 		});
// 	},
// 	addBlog: function(req,res,next){
// 		var blog = new Blog(req.body);
// 		console.log(req.body);
// 		blog.save(function(err,docs){
// 			console.log(docs);
// 			return res.json(docs);
// 		});

// 	},
// 	deleteBlog: function(req,res,next){
// 		var condition = req.body;
// 		Blog.remove(condition,function(err,docs){
// 			console.log('删除序号为' + condition.number + "博客");
// 			return res.json(docs);
// 		});
// 	},
// 	updateBlog:function(req,res,next){
// 		var condition = req.body.condition;
// 		var update = req.body.update;
// 		Blog.update(condition,{$set:update}).exec(function(err,docs){
// 			console.log('更新序号为' + condition + '的博客，更新内容为' + update);
// 			// return res.json(docs);
// 		});

// 		Blog.find().exec(function(err,docs){
// 			return res.json(docs);
// 		});
// 	}


// }
app.route('/addExpert').post(expertController.addExpert);

app.route('/getExpert').get(expertController.getExpert);


app.route('/addUser').post(userController.addUser);

app.route('/getUser').get(userController.getUser);

app.route('/updateUser').post(userController.updateUser);

// app.route('/getBlog').get(blogController.getBlog);

// app.route('/getBlogByConditions').post(blogController.getBlogByConditions);

// app.route('/addBlog').post(blogController.addBlog);

// app.route('/deleteBlog').post(blogController.deleteBlog);

// app.route('/updateBlog').post(blogController.updateBlog);


app.route('/getData').get(dataController.getData);
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