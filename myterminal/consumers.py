import json
import paramiko
from threading import Thread
from channels.generic.websocket import WebsocketConsumer


class SSHBridge(object):
    def __init__(self, websocket):
        self.websocket = websocket
        self.ssh_channel = None

    # def connect(self, host, port, username, authtype, password=None, pkey=None, term='xterm', cols=80, rows=24):
    def connect(self, host, port, username, password=None, term='xterm', cols=80, rows=24):
        # print('connect')
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            ssh.connect(hostname=host, port=port, username=username, password='lee123$%^', timeout=8)
            print('主机连接成功！')
        except Exception as e:
            print('主机连接失败!')
            message = json.dumps({'flag': 'error', 'message': str(e)})
            self.websocket.send(message)
            return False

        # 打开一个ssh通道并建立连接
        transport = ssh.get_transport()
        self.ssh_channel = transport.open_session()
        self.ssh_channel.get_pty(term=term, width=cols, height=rows)
        self.ssh_channel.invoke_shell()

        # 连接建立一次，之后交互数据不会再进入该方法
        for i in range(1):
            recv = self.ssh_channel.recv(1024).decode('utf-8', 'ignore')
            message = json.dumps({'flag': 'success', 'message': recv})
            print(message)
            self.websocket.send(recv)
        # print('connection fin')

    def close(self):
        # print('close')
        try:
            self.ssh_channel.close()
            self.ssh_channel = None
            self.websocket.close()    
        except BaseException as e:
            print('close ws err:'+ str(e))
        # print('close ws connection')

    def _ws_to_ssh(self, data):
        # print('ws to ssh')
        try:
            self.ssh_channel.send(data)
        except OSError as e:
            self.close()

    def _ssh_to_ws(self):
        # print('ssh to ws')
        try:
            while not self.ssh_channel.exit_status_ready():
                data = self.ssh_channel.recv(1024).decode('utf-8', 'ignore')
                if len(data) != 0:
                    message = {'flag': 'success', 'message': data}
                    # print(message)
                    self.websocket.send(data)
                else:
                    break
        except Exception as e:
            message = {'flag': 'error', 'message': str(e)}
            print(message)
            self.websocket.send(e)

            self.close()

    def shell(self, data):
        # print('shell')
        Thread(target=self._ws_to_ssh, args=(data,)).start()
        Thread(target=self._ssh_to_ws).start()

    def resize_pty(self, cols, rows):
        self.ssh_channel.resize_pty(width=cols, height=rows)


class SSHConsumer(WebsocketConsumer):
    # ssh = None

    def connect(self):
        self.accept()
        # ssh_connect_args = {'host':'10.4.122.33', 'username': 'user', 'port':22}

        self.ssh = SSHBridge(websocket=self)
        self.ssh.connect(host='127.0.0.1', port=7300, username='root')

    def disconnect(self, code):
        # print('start close ws connection')
        self.ssh.close()
        pass
        

    def receive(self, text_data=None):
        text_data = json.loads(text_data)

        if text_data.get('flag') == 'resize':
            self.ssh.resize_pty(cols=text_data['cols'], rows=text_data['rows'])
        else:
            self.ssh.shell(data=text_data.get('data', ''))
