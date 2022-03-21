from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse,JsonResponse, request
import json
from mymodule.get_status import *
from django.views.decorators.csrf import csrf_exempt
 
def hello(request):
    return HttpResponse("Hello world ! ")

def front(request):
    return render(request, 'weblive.html')  

def template(request):
    return render(request, 'bili.html')  

@csrf_exempt
def getauthresult(request):
    print('reach')
    if request.method == 'POST':
        req = json.loads(request.body)
        try:
            ret = run('127.0.0.1','8081')
            print(ret)
        except Exception as ex:
            print(ex)
            return JsonResponse({'result': 200, 'msg': 'unknow'})
        if ret == 1:
            return JsonResponse({'result': 200, 'msg': 'safe'})
        else:
            return JsonResponse({'result': 200, 'msg': 'unsafe'})