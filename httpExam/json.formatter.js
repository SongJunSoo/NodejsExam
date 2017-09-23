var http = require('http');

var output = [];
for(var i=0; i < 100; i++){
	output.push({
		key: 'key_' + i,
		value : Math.random()
	});
}

http.createServer(function(request, response){
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end(JSON.stringify(output));
}).listen(52273, function(){
	console.log('server running at http://127.0.0.1:52273')
})