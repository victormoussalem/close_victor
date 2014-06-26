from app import db, app
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.mutable import Mutable
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy import func
from datetime import datetime

class MutableList(Mutable, list):
    def append(self, value):
        list.append(self, value)
        self.changed()

    def remove(self, value):
        list.remove(self, value)
        self.changed()

    @classmethod
    def coerce(cls, key, value):
        if not isinstance(value, MutableList):
            if isinstance(value, list):
                return MutableList(value)
            return Mutable.coerce(key, value)
        else:
            return value

company_categories = db.Table('company_categories', 
	db.Column('left', db.Integer, db.ForeignKey('company.id')),
	db.Column('right', db.Integer, db.ForeignKey('category.id'))
	)
#TODO add location of acquisitions, add founder/employee information, add amount paid for acquisition. add date of acquisition, get category of acquisition
#Company
class Company(db.Model):
	id = db.Column(db.Integer, primary_key = True)

#	timestamp = db.Column(db.DateTime)
 	name = db.Column(db.String(255))
 	homepage_url = db.Column(db.String(255))
 	description = db.Column(db.Text)
 	founded_on_day = db.Column(db.Integer)
 	founded_on_month = db.Column(db.Integer)
 	founded_on_year = db.Column(db.Integer)
 	headquarters = db.Column(db.String(255))
#	headquarters = db.Column(db.String(255))
	#TODO figure out who the investors are for the funding rounds (Person? Organization?)
# 	funding_rounds = db.Column(db.String(255))
# 	acquisitions = db.Column((ARRAY(db.String)))	
	acquisitions = db.relationship('Acquisition', backref = 'acquirer', lazy = 'dynamic')
	aq = association_proxy('acquisitions', 'name')

	products = db.relationship('Product', backref = 'company')
	pd = association_proxy('products', 'name')

 	categories = db.relationship('Category',
 				secondary= company_categories,
 				backref='companies'
 		)
	ct = association_proxy('categories', 'name')

#	investments = db.Column(db.String(255))

	founders = db.relationship('Founder')
	fd = association_proxy('founders', 'name')

	competitors = db.relationship('Competitor', backref = 'company', lazy = 'dynamic')
	cp = association_proxy('competitors', 'name')

	news = db.relationship('News', backref = 'company', lazy = 'dynamic')
	nws = association_proxy('news', 'article_title')

	websites = db.relationship('Website', backref = 'company', lazy = 'dynamic')
	wb = association_proxy('websites', 'website_title')

	def __repr__(self):
		return '<Company %r>' % (self.name)

#	def __init__(self, **kwargs):
#		if kwargs.get('dict'):
#			self.from_dict(kwargs.get('dict'))

	def root_json(self):
		root = {}
		root["source"] = self.name
		root["target"] = list(self.aq)
		return root

	def dc_json(self):
		dc = {}
		dc["city"] = self.headquarters
		dc["name"] = self.name
		dc["description"] = self.description
		dc["homepage_url"] = self.homepage_url
		dc["founded_on_year"] = self.founded_on_year
		dc["founded_on_month"] = self.founded_on_month
		dc["founded_on_day"] = self.founded_on_day
#		dc["acquisition_date"] = self.acquisition_date
#		dc["url"] = se;f.url
		#take care of rest

	def from_dict(self, d):
		# Introspect model's fields
		for v in self.__table__.columns._data.keys():
			for l,a in d.items():
				# Is this fieldname in the dictionary?
				if l == v:
					setattr(self, v, d.get(v))
				elif isinstance(a, dict):
					if (self.from_dict(a) is not None):
						self.from_dict(a)
		#					setattr(self, v, val.get(v))
           #	print "setting %s to %s" % (v, d.get(v))

#Acquisition
class Acquisition(db.Model):
	id = db.Column(db.Integer, primary_key = True)

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	#TODO add String saying who acquired the company -> "Wilfire, acquired by Google"
	name = db.Column(db.String(255))
	year = db.Column(db.String(255))
	founders = db.Column(db.String(255))
	category = db.Column(db.String(255))
	amount = db.Column(db.String(255))
	location = db.Column(db.String(255))

	def __init__(self, name):
		self.name = name

#Category
class Category(db.Model):
	id = db.Column(db.Integer, primary_key = True)


	name = db.Column(db.String(255))

	def __init__(self, name):
		self.name = name

#Investment
class Investment(db.Model):
	id = db.Column(db.Integer, primary_key = True)

#Founder
class Founder(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	name = db.Column(db.String(255))

	def __init__(self, name):
		self.name = name
#	first_name = db.Column(db.String(255))
#	last_name = db.Column(db.String(255))

#Investor
class Investor(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	first_name = db.Column(db.String(255))
	last_name = db.Column(db.String(255))
	#investor could be a company rather than a person
#	company = db.Column(db.String(255))

#Funding Round
class FundingRound(db.Model):
	id = db.Column(db.Integer, primary_key=True)

#Product
class Product(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	name = db.Column(db.String(255))

 	def __init__(self, name):
 		self.name = name

#Only use proxy association with many-to-many relationship
#proxy the 'product' attribute from the 'products' relationship
#products = association_proxy('products', 'product')

#Press Articles
class News(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	article_title = db.Column(db.String(255))
	article_url = db.Column(db.String(255))
	article_date = db.Column(db.String(255))

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))

class Website(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	website_title = db.Column(db.String(255))
	website_url = db.Column(db.String(255))

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))

#Competitor
class Competitor(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	name = db.Column(db.String(255))
	uuid = db.Column(db.String(255))
	permalink = db.Column(db.String(255))
#competitors = db.Table('competitors',
#	db.Column('competitor_id', db.Integer, db.ForeignKey('company.id'))
#)
