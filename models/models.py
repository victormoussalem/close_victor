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

acquisition_categories = db.Table('acquisition_categories', 
	db.Column('left', db.Integer, db.ForeignKey('acquisition.id')),
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
 	founded_on_day = db.Column(db.String(255))
 	founded_on_month = db.Column(db.String(255))
 	founded_on_year = db.Column(db.String(255))
 	headquarters = db.Column(db.String(255))
 	number_of_employees = db.Column(db.String(255))
 	number_of_investments = db.Column(db.String(255))
 	number_of_funding_rounds = db.Column(db.String(255))
 	total_funding_usd = db.Column(db.String(255))

#	headquarters = db.Column(db.String(255))
	#TODO figure out who the investors are for the funding rounds (Person? Organization?)
# 	funding_rounds = db.Column(db.String(255))
# 	acquisitions = db.Column((ARRAY(db.String)))	
	acquisitions = db.relationship('Acquisition', backref = 'acquirer', lazy = 'dynamic')
	aq = association_proxy('acquisitions', 'name')

	products = db.relationship('Product', backref = 'company', lazy = 'dynamic')
	pd = association_proxy('products', 'name')

	investors = db.relationship('Investor', backref = 'company')
	iv = association_proxy('investors', 'name')

	categories = db.relationship('Category', backref='company', lazy='dynamic')

# 	categories = db.relationship('Category',
# 				secondary= company_categories,
# 				backref='company'
# 		)
	ct = association_proxy('categories', 'name')

#	investments = db.Column(db.String(255))

	founders = db.relationship('Founder', backref = 'company', lazy = 'dynamic')
	fd = association_proxy('founders', 'name')
	fd_education = association_proxy('founders', 'education')

	competitors = db.relationship('Competitor', backref = 'company', lazy = 'dynamic')
	cp = association_proxy('competitors', 'name')

	news = db.relationship('News', backref = 'company', lazy = 'dynamic')
	nws = association_proxy('news', 'article_title')
	nws_url = association_proxy('news', 'article_url')

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
		if (self.headquarters):
			dc["city"] = self.headquarters
		else:
			dc["city"] = " "

		if (self.name):
			dc["name"] = self.name
		else:
			dc["name"] = " "

		if (self.description):
			dc["description"] = self.description
		else:
			dc["description"] = " "

		if (self.homepage_url):
			dc["url"] = self.homepage_url
		else:
			dc["url"] = " "

		if (self.founded_on_year):
			dc["founded_date"] = self.founded_on_year
		else:
			dc["founded_date"] = " "

		#dc["founded_on_month"] = self.founded_on_month
		#dc["founded_on_day"] = self.founded_on_day

		if (self.number_of_employees):
			dc["number_of_employees"] = self.number_of_employees
		else:
			dc["number_of_employees"] = " "

		if (self.nws):
			dc["news_titles"] = list(self.nws)
		else:
			dc["news_titles"] = " "

		if (self.nws_url):	
			dc["news_urls"] = list(self.nws_url)
		else:
			dc["news_urls"] = " "

		if (self.fd):	
			dc["founders"] = list(self.fd)
		else:
			dc["founders"] = " "

		if (self.fd_education):
			dc["founder_education"] = list(self.fd_education)
		else:
			dc["founder_education"] = " "

		if (self.ct):
			dc["categories"] = list(self.ct)
		else:
			dc["categories"] = " "

		if (self.iv):
			dc["investors"] = list(self.iv)
		else:
			dc["investors"] = " "

		if (self.total_funding_usd):
			dc["total_funding_amount"] = self.total_funding_usd
		else:
			dc["total_funding_amount"] = " "

		if (self.number_of_investments):
			dc["num_funding_rounds"] = self.number_of_investments
		else:
			dc["num_funding_rounds"] = " "
		#have one for acquisitions as well with acquired_date
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
	acquisition_day = db.Column(db.String(255))
	acquisition_month = db.Column(db.String(255))
	acquisition_year = db.Column(db.String(255))
 	founded_on_day = db.Column(db.String(255))
 	founded_on_month = db.Column(db.String(255))
 	founded_on_year = db.Column(db.String(255))
	headquarters = db.Column(db.String(255))
	number_of_employees = db.Column(db.String(255))

 	homepage_url = db.Column(db.String(255))
 	number_of_investments = db.Column(db.String(255))
 	number_of_funding_rounds = db.Column(db.String(255))
 	description = db.Column(db.Text)
	total_funding_usd = db.Column(db.String(255))
	#number of investments

	investors_aq = db.relationship('Investor', backref = 'acquisition')
	iv_aq = association_proxy('investors_aq', 'name')

	categories_aq = db.relationship('Category', backref='acquisition', lazy='dynamic')

#	categories_aq = db.relationship('Category',
# 				secondary= acquisition_categories,
# 				backref='acquisition'
# 		)
	ct_aq = association_proxy('categories_aq', 'name')

#	investments = db.Column(db.String(255))

	founders_aq = db.relationship('Founder', backref = 'acquisition', lazy = 'dynamic')
	fd_aq = association_proxy('founders_aq', 'name')
	fd_aq_education = association_proxy('founders_aq', 'education')

	competitors_aq = db.relationship('Competitor', backref = 'acquisition', lazy = 'dynamic')
	cp_aq = association_proxy('competitors_aq', 'name')

	news_aq = db.relationship('News', backref = 'acquisition', lazy = 'dynamic')
	nws_aq = association_proxy('news_aq', 'article_title')
	nws_url_aq = association_proxy('news_aq', 'article_url')

	websites_aq = db.relationship('Website', backref = 'acquisition', lazy = 'dynamic')
	wb_aq = association_proxy('websites_aq', 'website_title')

	products_aq = db.relationship('Product', backref = 'acquisition', lazy = 'dynamic')
	pd_aq = association_proxy('products_aq', 'name')

	def dc_json(self):
		dc = {}

		if (self.headquarters):
			dc["city"] = self.headquarters
		else:
			dc["city"] = " "

		if (self.name):
			dc["name"] = self.name
		else:
			dc["name"] = " "

		if (self.description):	
			dc["description"] = self.description
		else:
			dc["description"] = " "

		if (self.homepage_url):	
			dc["url"] = self.homepage_url
		else:
			dc["url"] = " "

		if (self.founded_on_year):
			dc["founded_date"] = self.founded_on_year
		else:
			dc["founded_date"] = " "

		if (self.acquirer):
			dc["acquired_by"] = self.acquirer
		else:
			dc["acquired_by"] = " "
		#dc["founded_on_month"] = self.founded_on_month
		#dc["founded_on_day"] = self.founded_on_day

		if (self.number_of_employees):
			dc["number_of_employees"] = self.number_of_employees
		else:
			dc["number_of_employees"] = " "

		if (self.nws_aq):	
			dc["news_titles"] = list(self.nws_aq)
		else:
			dc["news_titles"] = " "

		if (self.nws_url_aq):	
			dc["news_urls"] = list(self.nws_url_aq)
		else:
			dc["news_urls"] = " "

		if (self.fd_aq):
			dc["founders_aq"] = list(self.fd_aq)
		else:
			dc["founders_aq"] = " "

		if (self.fd_aq_education):
			dc["founder_education"] = list(self.fd_aq_education)
		else:
			dc["founder_education"] = " "

		if (self.ct_aq):
			dc["categories"] = list(self.ct_aq)
		else:
			dc["categories"] = " "

		if (self.iv_aq):
			dc["investors"] = list(self.iv_aq)
		else:
			dc["investors"] = " "

		if (self.total_funding_usd):
			dc["total_funding_amount"] = self.total_funding_usd
		else:
			dc["total_funding_amount"] = " "

		if (self.number_of_investments):
			dc["num_funding_rounds"] = self.number_of_investments
		else:
			dc["num_funding_rounds"] = " "

#city(have this), name(have this), founded_date(have this), acquisition_date(have this), acquired_by(have this), url(have this), description(have this), founders(have this), founder_education(partial), categories(have this), investors(partial), total_funding_amount(partial), num_funding_rounds(partial), news_titles(have this), news_urls(have this)

#Number of employees

#Category
class Category(db.Model):
	id = db.Column(db.Integer, primary_key = True)

	name = db.Column(db.String(255))

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	acquisition_id = db.Column(db.Integer, db.ForeignKey('acquisition.id'))

#Investment
class Investment(db.Model):
	id = db.Column(db.Integer, primary_key = True)

#Founder
class Founder(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	name = db.Column(db.String(255))
	education = db.Column(db.String(255))

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	acquisition_id = db.Column(db.Integer, db.ForeignKey('acquisition.id'))

#	first_name = db.Column(db.String(255))
#	last_name = db.Column(db.String(255))

#Investor
class Investor(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	name = db.Column(db.String(255))
	investor_type = db.Column(db.String(255))
	#investor_type = db.Column(db.String(255))

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	acquisition_id = db.Column(db.Integer, db.ForeignKey('acquisition.id'))
	#investor could be a company rather than a person
#	company = db.Column(db.String(255))

#Funding Round
class FundingRound(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	funding_type = db.Column(db.String(255))
	funding_amount = db.Column(db.String(255))

	investor_id = db.Column(db.Integer, db.ForeignKey('investor.id'))
	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	acquisition_id = db.Column(db.Integer, db.ForeignKey('acquisition.id'))


#Product
class Product(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	name = db.Column(db.String(255))

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	acquisition_id = db.Column(db.Integer, db.ForeignKey('acquisition.id'))

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
	acquisition_id = db.Column(db.Integer, db.ForeignKey('acquisition.id'))

class Website(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	website_title = db.Column(db.String(255))
	website_url = db.Column(db.String(255))

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	acquisition_id = db.Column(db.Integer, db.ForeignKey('acquisition.id'))

#Competitor
class Competitor(db.Model):
	id = db.Column(db.Integer, primary_key=True)

	name = db.Column(db.String(255))

	company_id = db.Column(db.Integer, db.ForeignKey('company.id'))
	acquisition_id = db.Column(db.Integer, db.ForeignKey('acquisition.id'))
	
#competitors = db.Table('competitors',
#	db.Column('competitor_id', db.Integer, db.ForeignKey('company.id'))
#)
