var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname+'/public'))

// 크로스도메인 이슈 대응 (CORS), SJS 추가 2017.10.14
var cors = require('cors')();
app.use(cors);
  
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'test1234',
  database : 'restful' 
}); 
connection.connect();
/////////////////////////////////// 
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/restful';
var dbObj = null;
MongoClient.connect(url, function(err, db) {
  console.log("Connected correctly to server");
  dbObj = db;
});
///////////////////////////////////
var multer = require('multer');
var Storage = multer.diskStorage({
     destination: function(req, file, callback) {
         callback(null, "./public/upload_image/");
     },
     filename: function(req, file, callback) {
     		file.uploadedFile = file.fieldname + "_" + 
     			Date.now() + "_" + file.originalname;
     		console.log('file.uploadedFile:'+file.uploadedFile);
         callback(null, file.uploadedFile);
     }
 });
 var upload = multer({
     storage: Storage
 }).single("image");
app.post('/user/picture',function(req, res) {
	upload(req, res, function(err) {
		if (err) {
			res.send(JSON.stringify({result:false,db_result:err}));
		} else {
			res.send(JSON.stringify({result:true, url:req.file.uploadedFile,
				description:req.body.description}));
		}
	});
});
///////////////////////////////////
// parent
///////////////////////////////////
app.post('/parent',function(req,res){
	connection.query(
		'insert into hpkl_parent(device_token, name, birth, gender, picture_url) values(?,?,?,?,?)',
		[ req.body.device_token, req.body.name, req.body.birth, req.body.gender, req.body.picture_url ],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify({result:false,db_result:err}));
			} else {
				res.send(JSON.stringify({result:true,db_result:result}));
			}
		})
});
app.put('/parent',function(req,res){
	connection.query( 
		'update hpkl_parent set name=?,birth=?,gender=?,picture_url=? where hpkl_id=?',
		[ req.body.name, req.body.birth, req.body.gender, req.body.picture_url,req.body.hpkl_id ],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		})
});  
app.get('/parent',function(req,res){ 
	connection.query('select hpkl_id,device_token,name,birth,gender,picture_url from hpkl_parent where device_token=?',
		[req.query.device_token], function(err, results, fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify({result:true,
											hpkl_id:results[0].hpkl_id,
											db_result:results
											})); 
				} else {
					res.send(JSON.stringify({result:false,
											db_result:null
											})); 
				}
				
			}
		});
});
///////////////////////////////////
// child
///////////////////////////////////
app.post('/child',function(req,res){
	connection.query(
		'insert into hpkl_child(hpkl_id, name, birth, gender, hpkl_total_saving_love, picture_url) values(?, ?,?,?,?,?)',
		[ req.body.hpkl_id, req.body.name, req.body.birth, req.body.gender, "0", req.body.picture_url ],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify({result:false,db_result:err}));
			} else {
				
				//  res.send(JSON.stringify(result));
      			connection.query('select max(hpkl_id) hpkl_id, max(hpkl_child_id) hpkl_child_id from hpkl_child where hpkl_id=?',
      			[ req.body.hpkl_id ],
      			function(err,result){
         		if (err) {
           				res.send(JSON.stringify({result:false,db_result:err}));
         		} else
         		{
           				res.send(JSON.stringify({result:true,
										 hpkl_id:req.body.hpkl_id,
										 db_result:result}));
         		}
      			});	
			}
		})
}); 
app.put('/child',function(req,res){
	connection.query( 
		'update hpkl_child set name=?,birth=?,gender=?,hpkl_total_saving_love=?,picture_url=? where hpkl_id=? and hpkl_child_id=?',
		[ req.body.name, req.body.birth, req.body.gender, req.body.hpkl_total_saving_love,req.body.picture_url,req.body.hpkl_id ,req.body.hpkl_child_id],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(result));
			}
		})
});
app.get('/childlist',function(req,res){ 
	connection.query('select hpkl_id,hpkl_child_id,name,birth,gender,hpkl_total_saving_love,picture_url from hpkl_child where hpkl_id=? order by hpkl_child_id',
		[req.query.hpkl_id, req.query.hpkl_child_id], function(err, results, fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify({result:true,
											hpkl_id:results[0].hpkl_id,
											db_result:results
											})); 
				} else {
					res.send(JSON.stringify({result:false,
											db_result:null
											})); 
				}
				
			}
		});
});

app.get('/child',function(req,res){ 
	connection.query('select hpkl_id,hpkl_child_id,name,birth,gender,hpkl_total_saving_love,picture_url from hpkl_child where hpkl_id=? and hpkl_child_id=?',
		[req.query.hpkl_id, req.query.hpkl_child_id], function(err, results, fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify({result:true,
											db_result:results
											})); 
				} else {
					res.send(JSON.stringify({result:false,
											db_result:null
											})); 
				}
				
			}
		});
});
///////////////////////////////////
// sticker
///////////////////////////////////
app.get('/sticker',function(req,res){ 	
	connection.query('select hpkl_sticker_code_value,hpkl_sticker_code_name,hpkl_sticker_group,hpkl_sticker_group_name,hpkl_sticker_icon_url from hpkl_praise_sticker_kind',
		function(err,results,fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				res.send(JSON.stringify(results));
			}
		});
});
///////////////////////////////////
// praise 
///////////////////////////////////
app.post('/child/praise',function(req,res){ 
	connection.query(
		'insert into hpkl_praise(hpkl_id, hpkl_child_id, hpkl_date, hpkl_time, hpkl_saving_love, hpkl_praise_memo, hpkl_praise_picture_url, hpkl_sticker_name, hpkl_sayong_gbn) values(?,?,?,?,?,?,?,?, "1")',
		[ req.body.hpkl_id, req.body.hpkl_child_id, req.body.hpkl_date, req.body.hpkl_time, req.body.hpkl_saving_love, req.body.hpkl_praise_memo, req.body.hpkl_praise_picture_url, req.body.hpkl_sticker_name ],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify({result:false,db_result:err}));
			} else {
				
				 //  res.send(JSON.stringify(result));
      			connection.query('update hpkl_child set hpkl_total_saving_love=hpkl_total_saving_love + ? where hpkl_id = ?  and hpkl_child_id = ?',
      			[ req.body.hpkl_saving_love, req.body.hpkl_id, req.body.hpkl_child_id ],
      			function(err,result){
         		if (err) {
           				res.send(JSON.stringify({result:false,db_result:err}));
         		} else
         		{
           				res.send(JSON.stringify({result:true,
										 hpkl_id:req.body.hpkl_id,
										 hpkl_child_id:req.body.hpkl_child_id,
										 db_result:result}));
         		}
      			});  

			}
		}) 
}); 

app.post('/child/present',function(req,res){ 
	connection.query(
		'insert into hpkl_praise(hpkl_id, hpkl_child_id, hpkl_date, hpkl_time, hpkl_saving_love, hpkl_praise_memo, hpkl_praise_picture_url, hpkl_sticker_name, hpkl_sayong_gbn) values(?,?,?,?,?,?,?,?, "2")',
		[ req.body.hpkl_id, req.body.hpkl_child_id, req.body.hpkl_date, req.body.hpkl_time, req.body.hpkl_saving_love, req.body.hpkl_praise_memo, req.body.hpkl_praise_picture_url, req.body.hpkl_sticker_name ],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify({result:false,db_result:err}));
			} else {
				
				 //  res.send(JSON.stringify(result));
      			connection.query('update hpkl_child set hpkl_total_saving_love = hpkl_total_saving_love - ? where hpkl_id = ?  and hpkl_child_id = ?',
      			[ req.body.hpkl_saving_love, req.body.hpkl_id, req.body.hpkl_child_id ],
      			function(err,result){
         		if (err) {
           				res.send(JSON.stringify({result:false,db_result:err}));
         		} else
         		{
           				res.send(JSON.stringify({result:true,
										 hpkl_id:req.body.hpkl_id,
										 hpkl_child_id:req.body.hpkl_child_id,
										 db_result:result}));
         		}
      			});  

			}
		}) 
}); 


app.post('/child/praise',function(req,res){
	connection.query( 
		'update hpkl_praise set hpkl_saving_love=?,hpkl_praise_memo=?,hpkl_praise_picture_url=? where hpkl_id=? and hpkl_child_id=? and hpkl_date=? and hpkl_time=?',
		[req.body.hpkl_id, req.body.hpkl_child_id, req.body.hpkl_date, req.body.hpkl_time, req.body.hpkl_saving_love],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				 //  res.send(JSON.stringify(result));
      			connection.query('update hpkl_child set hpkl_total_saving_love = hpkl_total_saving_love + ? where hpkl_id = ?  and hpkl_child_id = ?',
      			[ req.body.hpkl_saving_love, req.body.hpkl_id, req.body.hpkl_child_id ],
      			function(err,result){
         		if (err) {
           				res.send(JSON.stringify({result:false,db_result:err}));
         		} else
         		{
           				res.send(JSON.stringify({result:true,
										 hpkl_id:req.body.hpkl_id,
										 hpkl_child_id:req.body.hpkl_child_id,
										 db_result:result}));
         		}
      			});  
			}
		})
});

app.post('/child/present',function(req,res){
	connection.query( 
		'update hpkl_praise set hpkl_saving_love=?,hpkl_praise_memo=?,hpkl_praise_picture_url=? where hpkl_id=? and hpkl_child_id=? and hpkl_date=? and hpkl_time=?',
		[req.body.hpkl_id, req.body.hpkl_child_id, req.body.hpkl_date, req.body.hpkl_time, req.body.hpkl_saving_love],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				 //  res.send(JSON.stringify(result));
      			connection.query('update hpkl_child set hpkl_total_saving_love = hpkl_total_saving_love + ? where hpkl_id = ?  and hpkl_child_id = ?',
      			[ req.body.hpkl_saving_love, req.body.hpkl_id, req.body.hpkl_child_id ],
      			function(err,result){
         		if (err) {
           				res.send(JSON.stringify({result:false,db_result:err}));
         		} else
         		{
           				res.send(JSON.stringify({result:true,
										 hpkl_id:req.body.hpkl_id,
										 hpkl_child_id:req.body.hpkl_child_id,
										 db_result:result}));
         		}
      			});  
			}
		})
});


app.post('/child/praise/delete',function(req,res){
	connection.query( 
		'delete from hpkl_praise where hpkl_id=? and hpkl_child_id=? and hpkl_date=? and hpkl_time=?',
		[req.body.hpkl_id, req.body.hpkl_child_id, req.body.hpkl_date, req.body.hpkl_time, req.body.hpkl_saving_love],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				 //  res.send(JSON.stringify(result));
      			connection.query('update hpkl_child set hpkl_total_saving_love = hpkl_total_saving_love - ? where hpkl_id = ?  and hpkl_child_id = ?',
      			[ req.body.hpkl_saving_love, req.body.hpkl_id, req.body.hpkl_child_id ],
      			function(err,result){
         		if (err) {
           				res.send(JSON.stringify({result:false,db_result:err})); 
         		} else
         		{
           				res.send(JSON.stringify({result:true,
										 hpkl_id:req.body.hpkl_id,
										 hpkl_child_id:req.body.hpkl_child_id,
										 db_result:result}));
         		}
      			});  
			}
		})
});

app.post('/child/present/delete',function(req,res){
	connection.query( 
		'delete from hpkl_praise where hpkl_id=? and hpkl_child_id=? and hpkl_date=? and hpkl_time=?',
		[req.body.hpkl_id, req.body.hpkl_child_id, req.body.hpkl_date, req.body.hpkl_time, req.body.hpkl_saving_love],
		function(err, result) {
			if (err) {
				res.send(JSON.stringify(err)); 
			} else {
				 //  res.send(JSON.stringify(result));
      			connection.query('update hpkl_child set hpkl_total_saving_love = hpkl_total_saving_love + ? where hpkl_id = ?  and hpkl_child_id = ?',
      			[ req.body.hpkl_saving_love, req.body.hpkl_id, req.body.hpkl_child_id ],
      			function(err,result){
         		if (err) {
           				res.send(JSON.stringify({result:false,db_result:err})); 
         		} else
         		{
           				res.send(JSON.stringify({result:true,
										 hpkl_id:req.body.hpkl_id,
										 hpkl_child_id:req.body.hpkl_child_id,
										 db_result:result}));
         		}
      			});  
			}
		})
});


app.get('/child/praise',function(req,res){ 
	connection.query('select b.name hpkl_child_name, b.picture_url hpkl_child_picture_url, a.hpkl_id,a.hpkl_child_id,a.hpkl_date,a.hpkl_time,a.hpkl_saving_love,a.hpkl_praise_memo,a.hpkl_praise_picture_url, a.hpkl_sticker_name, a.hpkl_sayong_gbn' 
					  +' from hpkl_praise a , hpkl_child b '
					  +'where a.hpkl_id= ? and a.hpkl_id = b.hpkl_id and a.hpkl_child_id = b.hpkl_child_id order by hpkl_date desc, hpkl_time desc',
	//connection.query('select hpkl_id,hpkl_child_id,hpkl_date,hpkl_time,hpkl_saving_love,hpkl_praise_memo,hpkl_praise_picture_url, hpkl_sticker_name from hpkl_praise where hpkl_id=?',
		[req.query.hpkl_id], function(err, results, fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify({result:true,
											db_result:results
											})); 
				} else {
					res.send(JSON.stringify({result:false,
											db_result:null
											})); 
				}
				
			}
		});
});     
app.get('/child/praise/child',function(req,res){ 
	connection.query('select b.name hpkl_child_name, b.picture_url hpkl_child_picture_url, a.hpkl_id,a.hpkl_child_id,a.hpkl_date,a.hpkl_time,a.hpkl_saving_love,a.hpkl_praise_memo,a.hpkl_praise_picture_url, a.hpkl_sticker_name, a.hpkl_sayong_gbn' 
					  +' from hpkl_praise a , hpkl_child b '
					  +'where a.hpkl_id= ? and a.hpkl_child_id = ? and a.hpkl_id = b.hpkl_id and a.hpkl_child_id = b.hpkl_child_id order by hpkl_date desc, hpkl_time desc',
		[req.query.hpkl_id, req.query.hpkl_child_id], function(err, results, fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify({result:true,
											db_result:results
											})); 
				} else {
					res.send(JSON.stringify({result:false,
											db_result:null
											})); 
				}
				
			}
		});
});

app.get('/child/praise/child/sangse',function(req,res){ 
	connection.query('select b.name hpkl_child_name, b.picture_url hpkl_child_picture_url, a.hpkl_id,a.hpkl_child_id,a.hpkl_date,a.hpkl_time,a.hpkl_saving_love,a.hpkl_praise_memo,a.hpkl_praise_picture_url, a.hpkl_sticker_name, a.hpkl_sayong_gbn' 
					  +' from hpkl_praise a , hpkl_child b '
					  +'where a.hpkl_id= ? and a.hpkl_child_id = ? and a.hpkl_date= ? and a.hpkl_time = ? and a.hpkl_id = b.hpkl_id and a.hpkl_child_id = b.hpkl_child_id order by hpkl_date desc, hpkl_time desc',
		[req.query.hpkl_id, req.query.hpkl_child_id, req.query.hpkl_date, req.query.hpkl_time], function(err, results, fields) {
			if (err) {
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify({result:true,
											db_result:results
											})); 
				} else {
					res.send(JSON.stringify({result:false,
											db_result:null
											})); 
				}
				
			}
		});
});

app.get('/child/praise/list',function(req,res){ 
	connection.query('select hpkl_id,hpkl_child_id,hpkl_date,hpkl_time,hpkl_saving_love,hpkl_praise_memo,hpkl_praise_picture_url, hpkl_sticker_name, hpkl_sayong_gbn from hpkl_praise where hpkl_id=? and hpkl_child_id=? and hpkl_date=? and hpkl_time=?',
		[req.query.hpkl_id, req.query.hpkl_child_id, req.query.hpkl_date, req.query.hpkl_time], function(err, results, fields) {
			if (err) { 
				res.send(JSON.stringify(err));
			} else {
				if (results.length > 0) {
					res.send(JSON.stringify(results));
				} else {
					res.send(JSON.stringify({}));
				}
				
			}
		});
});
app.listen(52274,function() {
	console.log('Server running');
}); 

////////////////////////////////////////////////////////////////////////////////

