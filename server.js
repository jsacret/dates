var app = require('express')();
var http = require('http').Server(app);
//var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// io.on('connection', function(socket){
//     console.log('a user connected');

//     socket.on('disconnect', function(){
//         console.log('user ' + socket.id + ' disconnected');
//     });

//     socket.on('chat message', function(message){
//         io.emit('chat message', message);
//     });
// });

http.listen(process.env.PORT || 8080, function(){
    console.log('listening on ' + process.env.PORT);
});