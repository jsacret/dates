var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {};

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('chat message', 'a user connected');

    socket.on('disconnect', function(){
        console.log('user ' + socket.name + ' disconnected');
        delete users[socket.name];
    });

    socket.on('close', function(){
        if(socket.name){
            delete users[socket.name];
        }

        if(socket.otherName){
            console.log('Disconnecting from ', socket.otherName);
            var conn = users[socket.otherName];
            conn.otherName = null;

            if(conn != null){
                sendTo(conn, {
                    type: 'leave'
                });
            }
        }
    });

    socket.on('chat message', function(message){
        console.log('message received');
        var data;
        try{
            data = JSON.parse(message);
        }catch(err){
            console.log('Invalid JSON');
            var data = {};
        }

        switch(data.type){
            case "login":
                console.log('User logged: ', data.name);
                if(users[data.name]){
                    sendTo(socket, {
                        type: "login",
                        success: false
                    });
                }else{
                    users[data.name] = socket;
                    socket.name = data.name;
                     
                    sendTo(socket, {
                        type: 'login',
                        success: true
                    });
                }
                break;
            case "offer":
                console.log('Sending offer to: ', data.name);
                var conn = users[data.name];
                if(conn != null){
                    socket.otherName = data.name;
                    sendTo(conn, {
                        type: 'offer',
                        offer: data.sdp,
                        name: socket.name
                    });
                }
                break;
            case "answer":
                console.log('Sending answer to ', data.name);
                var conn = users[data.name];
                if(conn != null){
                    sendTo(conn, {
                        type: 'answer',
                        answer: data.sdp
                    });
                }
                break;
            case "icecandidate":
                console.log('Sending candidate to: ', data.name);
                var conn = users[data.name];
                sendTo(conn, {
                    type: 'candidate',
                    candidate: data.candidate
                });
                break;
            case "leave":
                console.log('Disconnecting from: ', data.name);
                var conn = users[data.name];
                conn.otherName = null;

                if(conn != null){
                    sendTo(conn, {
                        type: 'leave'
                    });
                }
                break;
            default:
                sendTo(socket, {
                    type: 'error',
                    message: 'Command not found: ' + data.type
                });
                break;
        }
        

    });
});

function sendTo(socket, message){
    socket.emit("chat message", JSON.stringify(message));
}

http.listen(process.env.PORT || 25000, function(){
    console.log('listening on 25000');
});
