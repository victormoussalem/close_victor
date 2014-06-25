from app import app
import os
#from models import *
import json
from flask import jsonify
import models

from flask import render_template, url_for


@app.route('/main')
def main(root=None):
	return render_template('main.html')

@app.route('/')
def index(root=None):
    acq = models.Company.query.all()

    root = []

    for u in acq:
	root.append(u.root_json())

#	    root = {u.name: list(u.aq) for u in acq}

    return render_template('index.html', root=root)

@app.route('/static/funding-rounds')
def crossfilter_funding_rounds(root=None):
	return render_template('funding-rounds.html')

@app.route('/static/dropbox')
def crossfilter_dropbox(root=None):
    acq = models.Company.query.all()

    root = []

    for u in acq:
	root.append(u.root_json())

#    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
#    yelp_data_url = os.path.join(SITE_ROOT, "static/crossfilter/data/yelp_test_set_business.json")
#    yelp_data = json.load(open(yelp_data_url))

    return render_template('indexDropbox.html', root=root)


@app.route('/static/facebook')
def crossfilter_facebook(root=None):
	return render_template('indexFacebook.html')

@app.route('/static/pinterest')
def crossfilter_pinterest():
	return render_template('indexPinterest.html')

@app.route('/static/google')
def crossfilter_google():
	return render_template('indexGoogle.html')

@app.route('/static/samsung')
def crossfilter_samsung():
	return render_template('indexSamsung.html')

@app.route('/static/verizon')
def crossfilter_verizon():
	return render_template('indexVerizon.html')

@app.route('/static/gopro')
def crossfilter_gopro():
	return render_template('indexGopro.html')

@app.route('/static/microsoft')
def crossfilter_microsoft():
	return render_template('indexMicrosoft.html')

@app.route('/static/twitter')
def crossfilter_twitter():
	return render_template('indexTwitter.html')

@app.route('/static/apple')
def crossfilter_apple():
	return render_template('indexApple.html')

"""
#@app.route('/acquisitions.json')
def acquisitions_json():
	acq = model.Company.query.all()
	root = {}
	root [acq.name] = acq.acquisitions
	print jsonify(root)
	return jsonify(root)
"""
"""
class Company:
	def tree_json(self):
		tree = {}
		tree["name"] = self.name
		tree["acquisitions"] = self.acquisitions
		return tree
"""

