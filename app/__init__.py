from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
db = SQLAlchemy(app)

app.secret_key = 'a2isj913ndf9*10f0f[if9]9un!nn%n'

HEROKU = 'HEROKU' in os.environ

if HEROKU:
    print "heroku"
    print DATABASE_URL
    print SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
else:
    print "not heroku"
    app.config['DEBUG'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/close_projects'
    app.config['SQLALCHEMY_ECHO'] = False
