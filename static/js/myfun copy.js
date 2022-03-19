var interval;
var flvPlayer;
window.onload = videoInit;

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


function videoInit() {
    if (flvjs.isSupported()) {
        var videoElement = document.getElementById('videoElement');
        flvPlayer = flvjs.createPlayer({
            type: 'flv',
            isLive: true,
            hasvideo: true,
            hasAudio: false,
            url: 'http://10.4.122.2:81/flv?port=1936&app=live&stream=video'
            // url: 'http://10.4.122.2/flv?port=1936&app=live&stream=video'
            // url: 'rtsp://10.4.122.2/live/video?secret=035c73f7-bb6b-4889-a715-d9eb2d1925cc'
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
    }
}


let loadVideoBt = document.getElementById('loadVideoBt');
loadVideoBt.onclick = function () {
    if (flvPlayer != null){
        flvPlayer.unload();
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
    }       
};

let startVideoBt = document.getElementById('startVideoBt');
startVideoBt.onclick = function () {
    if (flvPlayer != null)
        flvPlayer.play();
};

let stopVideoBt = document.getElementById('stopVideoBt');
stopVideoBt.onclick = function () {
    if (flvPlayer != null)    
        flvPlayer.pause();
};


function timelyAuth() {
    let staForm = document.getElementById('status');
    let xhrRegister = new XMLHttpRequest();
    
    ajaxResponse(xhrRegister,
        function () {
            let response = JSON.parse(xhrRegister.responseText);
            console.log(response.msg);
            if (response.msg === 'safe') {
                console.log('safe');
                staForm.innerHTML = '可信';
                staForm.style.color='black';
            } else {
                console.log('unsafe');
                staForm.innerHTML = '不可信';
                staForm.style.color='red';
            }

        }, function () {
            // let respones = JSON.parse(xhrRegister.responseText);

        });

    xhrRegister.open('POST', '../getstatus/');
    xhrRegister.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=utf-8');
    xhrRegister.send(JSON.stringify("getsta"));
};



let subStartBt = document.getElementById('startAuthBt');
subStartBt.onclick = function () {
    console.log("start checking");
    interval = setInterval(timelyAuth, 30);
};


let endAuthBt = document.getElementById('endAuthBt');
endAuthBt.onclick = function () {
    console.log("stop checking");
    clearInterval(interval);
};



