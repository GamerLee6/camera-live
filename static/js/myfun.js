var interval;
var flvPlayer;
var h = 480;
var w = 640;
var player = null;

function ajaxResponse(xhr, successFunction, falseFunction) {
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                successFunction();
            } else {
                // alert("失败" + xhr.status);
                falseFunction();
            }
        }
    }
};


function start_play() {
    // let url = document.getElementById('vidoeUrl').value;
    // console.log(url);

    player = new ZLMRTCClient.Endpoint(
        {
            element: document.getElementById('video'),// video 标签
            debug: false,// 是否打印日志
            zlmsdpUrl: 'http://139.196.156.60:8080/index/api/webrtc?app=live&stream=video&type=play',//流地址
            simulcast: false,
            useCamera: false,
            audioEnable: false,
            videoEnable: true,
            recvOnly: true,
            resolution: { w: w, h: h }
        }
    );

    player.on(ZLMRTCClient.Events.WEBRTC_ICE_CANDIDATE_ERROR, function (e) {// ICE 协商出错
        console.log('ICE 协商出错')
    });

    player.on(ZLMRTCClient.Events.WEBRTC_ON_REMOTE_STREAMS, function (e) {//获取到了远端流，可以播放
        console.log('播放成功', e.streams)
    });

    player.on(ZLMRTCClient.Events.WEBRTC_OFFER_ANWSER_EXCHANGE_FAILED, function (e) {// offer anwser 交换失败
        console.log('offer anwser 交换失败', e)
        stop();
    });

    player.on(ZLMRTCClient.Events.WEBRTC_ON_LOCAL_STREAM, function (s) {// 获取到了本地流

        // document.getElementById('selfVideo').srcObject = s;
        // document.getElementById('selfVideo').muted = true;

        //console.log('offer anwser 交换失败',e)
    });

    player.on(ZLMRTCClient.Events.CAPTURE_STREAM_FAILED, function (s) {// 获取本地流失败

        console.log('获取本地流失败')
    });

    player.on(ZLMRTCClient.Events.WEBRTC_ON_CONNECTION_STATE_CHANGE, function (state) {// RTC 状态变化 ,详情参考 https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionState
        console.log('当前状态==>', state)
    });
}

let startVideoBt = document.getElementById('startVideoBt');
startVideoBt.onclick = function start() {
    stop();
    start_play()
}

let stopVideoBt = document.getElementById('stopVideoBt');
stopVideoBt.onclick = function stop() {
    if (player) {
        player.close();
        player = null;
    }
}


function timelyAuth() {
    let staForm = document.getElementById('status');
    let xhrRegister = new XMLHttpRequest();

    ajaxResponse(xhrRegister,
        function () {
            let response = JSON.parse(xhrRegister.responseText);
            // console.log(response.msg);
            if (response.msg === 'safe') {
                console.log('safe');
                staForm.innerHTML = '可信';
                staForm.style.color = 'black';
            } else {
                console.log('unsafe');
                staForm.innerHTML = '不可信';
                staForm.style.color = 'red';
            }

        }, function () {
            console.log('unkonw');
            staForm.innerHTML = '不可信';
            staForm.style.color = 'red';
        });

        let para = {
            status: 'start'
        }
    
    xhrRegister.open('POST', '../getstatus/');
    xhrRegister.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=utf-8');
    xhrRegister.send(JSON.stringify(para));
};

let subStartBt = document.getElementById('startAuthBt');
subStartBt.onclick = function () {
    console.log("start checking");
    timelyAuth();
    interval = setInterval(timelyAuth, 15000);
};

let endAuthBt = document.getElementById('endAuthBt');
endAuthBt.onclick = function () {
    console.log("stop checking");
    clearInterval(interval);

    let xhrRegister = new XMLHttpRequest();
    ajaxResponse(xhrRegister,
        function () {
            let response = JSON.parse(xhrRegister.responseText);
            console.log(response.msg);
            if (response.msg === 'OK') {
                console.log('checking is closed');
            } else {
                console.log('checking can not be closed');
            }
        }, function () {
            // let respones = JSON.parse(xhrRegister.responseText);

        });

    let para = {
        status: 'stop'
    }
    
    xhrRegister.open('POST', '../getstatus/');
    xhrRegister.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=utf-8');
    xhrRegister.send(JSON.stringify(para));
};
