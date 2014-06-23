''' Manager.py manages database and other convenience functions.
Add to .env file (using autoenv) to be able to just call 'app run'!
echo alias app=\'python manager.py\' >> .env

'''
from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand

from termcolor import colored

from app import app, db
from models import *

migrate = Migrate(app, db)

manager = Manager(app)
manager.add_command('db', MigrateCommand)

@manager.command
def db_init():
    print colored("Creating model tables.", "yellow")
    db.create_all(bind=None)
    print colored("Done!", "green")

@manager.command
def run():
    app.run(debug=True)

if __name__ == '__main__':
    manager.run()
