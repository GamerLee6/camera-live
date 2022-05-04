var terminal = document.getElementById('terminal');

var term = new Terminal(
    {
        // cols: Math.floor(terminal.clientWidth / 9),     //列数
        // rows: Math.floor(terminal.clientHeight / 20),   //行数
        // cols: windows_width,     //列数
        // rows: windows_height,   //行数
        convertEol: true,  //启用时，光标将设置为下一行的开头
        cursorBlink: true, //光标闪烁
        rendererType: "canvas",  //渲染类型
        theme: {
            foreground: "#ECECEC", //字体
            background: "#000000", //背景色
            cursor: "help", //设置光标
            lineHeight: 20
        }
    }
);

var fitAddon = new FitAddon();
term.loadAddon(fitAddon);

var sock = new WebSocket("ws://" + window.location.host + "/ws/chat/");

sock.onopen = function () {
    term.open(terminal, true);      // 打开前端模拟终端界面
    // term.writeln('等待10s，出现命令行表示连接成功，没有出现则表示连接失败（检查参数跟网络）。');//这里连接失败是表示ssh连接失败.    
    fitAddon.fit();
};

sock.onerror = function (e) {
    console.log('error:' + e);
};

sock.onmessage = function (e) {
    term.write(e.data);
};

sock.onclose = function (e) {
    term.write('\n\r\x1B[1;3;31msocket is already closed.\x1B[0m');
    // term.destroy();
    sock.close();
};

term.onData(function (data) {
    sock.send(JSON.stringify({ 'data': data }));
});


window.sock = sock;

$(window).resize(function () {
    let cols = fitAddon.proposeDimensions().cols;
    let rows = fitAddon.proposeDimensions().rows;
    
    send_data = JSON.stringify({
        'flag': 'resize',
        'cols': cols,
        'rows': rows
    });

    sock.send(send_data);

    term.loadAddon(fitAddon);
    fitAddon.fit();
    term.resize(cols, rows)

    
})