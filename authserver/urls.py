"""authserver URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path

from camera_auth.views import * 

from django.views import static
from django.conf import settings
# from django.conf.urls import url

from myterminal.views import *
from myterminal.consumers import *

urlpatterns = [
 
    path('', front, name='home'),
    path('index/', template),
    path('getstatus/', getauthresult),
    path('attack/', attackHandler),
    path('sshcommand/',FakeSSH),
    path('admin/', admin.site.urls),
    re_path(r'weblive[0-9]+-[0-9]+', front, name='video'),
    re_path(r'^static/(?P<path>.*)$', static.serve,
      {'document_root': settings.STATIC_ROOT}, name='static'),
    path('ssh/', webssh, name="chat-url"),
]
