from functools import cmp_to_key
from sys import stderr, stdin, stdout
from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse,JsonResponse, request
import json
# from mymodule.get_status import *
from django.views.decorators.csrf import csrf_exempt

import socket, ssl
import time
import threading

import paramiko


def hello(request):
    return HttpResponse("Hello world ! ")

def front(request):
    return render(request, 'weblive.html')  

def template(request):
    return render(request, 'index.html')  


is_checking = False
sock = None
camera_status = 0
keep_running = 0
check_thread = None

 

def routine_check(ssl_sock):
    global camera_status
    while keep_running:
        # context = ssl.SSLContext(ssl.PROTOCOL_TLS)
        # context.verify_mode = ssl.CERT_NONE

        # ip_port = ('127.0.0.1', 8081)
        # sock = socket.socket()
        # ssl_sock = context.wrap_socket(sock, server_hostname='127.0.0.1')

        # ssl_sock.connect(ip_port)  
        
        server_reply = ssl_sock.recv(1024).decode()
        # print(server_reply)
        
        inp = 'REQ#$'
        ssl_sock.sendall(inp.encode())

        camera_status = int(ssl_sock.recv(1024).decode())
        # print(camera_status)
        sock.close()
        time.sleep(10)



def check():
    global keep_running
    keep_running = 1
    global sock
    global is_checking
    is_checking = True

    context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    context.verify_mode = ssl.CERT_NONE

    ip_port = ('127.0.0.1', 8081)
    sock = socket.socket()
    ssl_sock = context.wrap_socket(sock, server_hostname='127.0.0.1')

    ssl_sock.connect(ip_port)  
    
    global check_thread
    check_thread = threading.Thread(target=routine_check(ssl_sock,))
    check_thread.start()


    return 

def stop_check():
    global is_checking
    if is_checking == False:
        return
    global keep_running
    keep_running = 0
    global check_thread
    check_thread.join()
    global sock
    sock.close()
    
    is_checking = False
    return

@csrf_exempt
def getauthresult(request):
    print('reach')
    if request.method == 'POST':
        req = json.loads(request.body)
        if req['status'] == 'start':
            # print('para is start')
            if is_checking == False:
                try:
                    check()
                except Exception as ex:
                    print(ex)
                    return JsonResponse({'result': 404, 'msg': 'unknow'})
                time.sleep(3)
                # print('start###camera_status###',camera_status)
                if camera_status == 1:
                    return JsonResponse({'result': 200, 'msg': 'safe'})
                else:
                    return JsonResponse({'result': 200, 'msg': 'unsafe'})
            else:
                # print('running###camera_status###',camera_status)
                if camera_status == 1:
                    return JsonResponse({'result': 200, 'msg': 'safe'})
                else:
                    return JsonResponse({'result': 200, 'msg': 'unsafe'})
        if req['status'] == 'stop':
            # print('para is stop')
            stop_check()
            return JsonResponse({'result': 200, 'msg': 'OK'})


"""
the following funcion are discarded because add the web terminal
"""
under_attack = 0

def atkStart():
    print('start attack')
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname='127.0.0.1', port=7300, username='user', password='')
        stdin, stdout, stderr = ssh.exec_command('/home/malware')
        # print(stdout.read().decode())
        ssh.close()
        global under_attack
        under_attack = 1
    except Exception as e:
        print(e)
    print('attack fin')

def atkEnd():
    print('end attack')
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname='127.0.0.1', port=7300, username='user', password='')
        stdin, stdout, stderr = ssh.exec_command("kill $(ps aux | grep malware | grep -v grep | awk '{print $1}')")
        # print(stdout.read().decode())
        ssh.close()
        global under_attack
        under_attack = 0
    except Exception as e:
        print(e)
    print('end fin')
        

@csrf_exempt
def attackHandler(request):
    print('attack handle')
    if request.method == 'POST':
        req = json.loads(request.body)
        if req['status'] == 'start':
            if under_attack == 0:
                atkStart()
            return JsonResponse({'result': 200, 'msg': 'start attack succeed'})
        else:
            atkEnd()
            return JsonResponse({'result': 200, 'msg': 'end attack succeed'})
    if request.method == 'GET':
        return JsonResponse({'result': 200, 'msg': under_attack})

@csrf_exempt
def FakeSSH(request):
    print('call fakessh')
    if request.method == 'POST':
        req = json.loads(request.body)
        cmd_str = req['command']
        print(cmd_str)
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(hostname='127.0.0.1', port=7300, username='user', password='')
            cmd_str = 'sh --login -c "'+cmd_str+'"'
            print(cmd_str)
            stdin, stdout, stderr = ssh.exec_command(cmd_str)
            out = stdout.read().decode()
            err = stderr.read().decode()
            print()
            # print(stdout.read().decode())
            ssh.close()
        except Exception as e:
            print(e)
        return JsonResponse({'result': 200, 'stdout': out ,'stderr': err})