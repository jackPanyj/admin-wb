# coding=utf8

from fabric.api import *
from fabric.contrib.project import rsync_project, upload_project

dev_host = 'www@122.152.215.207'

def upload():
    local_dir = './dist/'
    remote_dir = '/home/www/test/fe'
    if local_dir[-1] != '/':
        local_dir += '/'
    rsync_project(local_dir=local_dir, remote_dir=remote_dir, delete=True)


@task
@hosts([dev_host])
def dev_upload():
    upload()


# @task
# @hosts([prodution_host])
# def production_upload():
#     print('')
#     print('production uploading in 5 seconds!!!!')
#     print('press Ctrl+c to cancel!!!')
#     import time
#     time.sleep(5)
#     upload()

# @task
# @hosts([dev_host, prodution_host])
# def double_upload():
#     upload()

# fab -f shuabei-next dev_upload/beta_upload/production_upload
