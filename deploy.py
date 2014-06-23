'''
Usage: deploy.py <remote_name> <branch_name>
Alter DEFAULT_BRANCH, DEFAULT_REMOTE and GITHUB_REMOTE
to reflect your local git setup (cat .git/config)
'''

import sys
import os
from termcolor import colored

DEFAULT_BRANCH = "master"
DEFAULT_REMOTE = "heroku"
GITHUB_REMOTE  = "origin"
AUTO_GITHUB    = True   # Push to GitHub before deploying?
AUTO_BRANCH    = True   # Automatically use current branch
AUTO_MIGRATE   = True   # Automatically migrate after deploy

def get_branch():
    import subprocess
    gitstatus = subprocess.check_output(['git', 'status'])
    endline = gitstatus.find('\n')
    return gitstatus[10:endline]

cur_branch = get_branch()
db_remote  = DEFAULT_REMOTE

if (len(sys.argv) == 1):
    # default args
    print colored("Deploying current branch %s to %s" % (cur_branch, DEFAULT_REMOTE), "cyan")
    cmd = 'git push %s %s:master' % (DEFAULT_REMOTE, cur_branch)
    github_cmd = 'git push %s %s' % (GITHUB_REMOTE, cur_branch)

if (len(sys.argv) > 1):
    if sys.argv[1] == "help":
        print "Usage: deploy <remote> <branch>"
        print "Default remote: %s" % DEFAULT_REMOTE
        print "Default branch: %s" % DEFAULT_BRANCH
        exit(0)
    if len(sys.argv) == 2:
        # deploy remote, e.g git push dev
        # will complain if we're not on master
        print "Deploying current branch %s to %s" % (cur_branch, sys.argv[1])
        cmd = 'git push %s %s:master' % (sys.argv[1], cur_branch)
        github_cmd = 'git push %s %s' % (GITHUB_REMOTE, cur_branch)
        if sys.argv[1] != db_remote:
            db_remote = sys.argv[1]
    if len(sys.argv) == 3:
        # deploy remote branch
        # heroku always requires :master if we're not on master
        branch = sys.argv[2]
        remote = sys.argv[1]
        print "Deploying %s to %s" % (branch, remote)
        cmd = 'git push %s %s:master' % (remote, branch)
        github_cmd = 'git push %s %s' % (GITHUB_REMOTE, branch)
        if remote != db_remote:
            db_remote = remote

print colored("Deploying to Heroku", "green")
os.system(cmd)
if AUTO_GITHUB:
    print
    print colored("Deploying to Github", "green")
    os.system(github_cmd)
print colored("\nDeploy complete.", "yellow")
if AUTO_MIGRATE:
    print colored("\nRunning migrations...\n", "yellow")
    if db_remote == "prod":
        os.system('heroku run python manager.py db upgrade --app close-data')
    else:
        os.system('heroku run python manager.py db upgrade')
else:
    print colored("\nDon't forget to run migrations manually.\n", "yellow")
