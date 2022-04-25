var window_width = $(window).width();
var window_height = $(window).height();
var term = new Terminal(
	{
		cols : Math.floor(window_width/9),     //列数
		rows : Math.floor(window_height/18),   //行数
		convertEol : true,  //启用时，光标将设置为下一行的开头
		cursorBlink: true, //光标闪烁
		rendererType: "canvas",  //渲染类型
	}
          );
$(function () {
	var sock = new WebSocket("ws://" + window.location.host + "{% url 'webssh' %}");
	// 打开webssh页面就打开web终端，并且打开websocket通道
	sock.addEventListener("open",function () {
		term.open(document.getElementById('terminal'));
		term.writeln('等待10s，出现命令行表示连接成功，没有出现则表示连接失败（检查参数跟网络）。');//这里连接失败是表示ssh连接失败.
	});
	//获取从ssh通道获取的outdata
	sock.addEventListener("message",function (recv) {
		term.write(recv.data);
		});
	//输入shelldata并发送到后台
	term.on("data",function (data) {
		sock.send(data)
		});
	window.sock=sock;
});


// function get_box_size() {
//         let init_width = 9;
//         let init_height = 22;

//         let windows_width = 960;
//         let windows_height = 720;

//         return {
//                 cols: Math.floor(windows_width / init_width),
//                 rows: Math.floor(windows_height / init_height),
//         }
// }

// function connectWebSocket(host_id = null, team = false) {
//         let cols = get_box_size().cols;
//         let rows = get_box_size().rows;
//         console.log(cols);

//         //根据div的大小初始化终端，待WebSocket连接上后，显示终端
//         let term = new Terminal(
//                 {
//                         cols: cols,
//                         rows: rows,
//                         useStyle: true,
//                         cursorBlink: true
//                 }
//         );

//         //建立WebSocket连接
//         if (host_id === null) {
//                 //获取表单中的信息，并去掉两端空格
//                 let host = '10.201.230.51';
//                 if (host === '') {
//                         toastr.warning('主机地址不能为空', '提示');
//                         return;
//                 }
//                 let port = '22';
//                 if (port === '') {
//                         toastr.warning('端口不能为空', '提示');
//                         return;
//                 }
//                 let user = 'root';
//                 if (user === '') {
//                         toastr.warning('用户名不能为空', '提示');
//                         return;
//                 }
//                 let auth = 'pwd';
        
//                 let pwd = '';
//                 pwd = window.btoa(pwd); //加密密码传输

//                 //组装为ssh连接参数
//                 let ssh_args = `user=${user}&host=${host}&port=${port}&auth=${auth}&pwd=${pwd}&sshkey_filename=''`;
//                 console.log(ssh_args);


//                 let ws_scheme = window.location.protocol === "https:" ? "wss" : "ws"; //获取协议
//                 let ws_port = (window.location.port) ? (':' + window.location.port) : '';  // 获取端口
//                 ws = new WebSocket(ws_scheme + '://' + window.location.host + ws_port + '/ws/webssh/?' + ssh_args + `&width=${cols}&height=${rows}`);
//         } else {
//                 //指定服务器id连接
//                 if (team) {
//                         let ws_scheme = window.location.protocol === "https:" ? "wss" : "ws"; //获取协议
//                         let ws_port = (window.location.port) ? (':' + window.location.port) : '';  // 获取端口
//                         ws = new WebSocket(ws_scheme + '://' + window.location.host + ws_port + `/ws/webssh/${host_id}/` + `?width=${cols}&height=${rows}&team=${team}`);
//                 } else {
//                         let ws_scheme = window.location.protocol === "https:" ? "wss" : "ws"; //获取协议
//                         let ws_port = (window.location.port) ? (':' + window.location.port) : '';  // 获取端口
//                         ws = new WebSocket(ws_scheme + '://' + window.location.host + ws_port + `/ws/webssh/${host_id}/` + `?width=${cols}&height=${rows}`);
//                 }

//         }

//         //打开websocket连接，并打开终端
//         ws.onopen = function () {
//                 console.log('WebSocket建立连接，打开Web终端');
//                 // $('#id-content').addClass('hide');
//                 // $('#id-ssh-content').removeClass('hide');

//                 term.open(document.getElementById('terminal'));
//         };
//         ws.onclose = function (e) {
//                 console.error('WebSocket关闭连接，关闭Web终端');
//                 // toastr.success('SSH连接已关闭', '消息');
//                 //term.write(message);
//                 setTimeout(function () {
//                         window.location.reload();
//                 }, 3000);
//         };

//         //读取服务器发送的数据并写入web终端
//         ws.onmessage = function (e) {
//                 console.log('WebSocket接收消息，ssh交互中');
//                 let data = JSON.parse(e.data);
//                 console.log(data);
//                 let message = data['message'];
//                 if (data.flag === 'msg') {
//                         term.write(message);
//                 } else if (data.flag === 'fail') {
//                         term.write(message);  //连接ssh的异常提示
//                         toastr.error(message + "返回登录页", '失败');
//                         setTimeout(function () {
//                                 window.location.reload();
//                         }, 5000);
//                 } else if (data.flag === 'user') {
//                         toastr.info(message, '消息');
//                 } else if (data.flag === 'error') {
//                         toastr.error(message, '失败');
//                         //term.write(message);
//                         setTimeout(function () {
//                                 window.location.reload();
//                         }, 5000);

//                 }

//         };

//         //向服务器发送数据,flag=1
//         term.on('data', function (data) {
//                 //data为每个按键输入内容，例如按A，就传递给后端：{'flag': 1, 'data': 'a', 'cols': None, 'rows': None}
//                 let send_data = JSON.stringify({
//                         'flag': 'entered_key',
//                         'entered_key': data,
//                         'cols': null,
//                         'rows': null
//                 });
//                 //向WebSocket发送消息，也就是输入的每一个按键
//                 ws.send(send_data)
//         });

//         //终端右上角显示的关闭连接安装，当点击是，关闭ws
//         $('#id-close-conn').click(function () {
//                 ws.close();
//         });

//         // 监听浏览器窗口, 根据浏览器窗口大小修改终端大小
//         $(window).resize(function () {
//                 let cols = get_box_size().cols;
//                 let rows = get_box_size().rows;
//                 console.log(`更改显示终端窗口大小，行${rows}列${cols}`);
//                 let send_data = JSON.stringify({ 'flag': 'resize', 'cols': cols, 'rows': rows });
//                 ws.send(send_data);
//                 term.resize(cols, rows) //调整页面终端大小
//         })
// }
