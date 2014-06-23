import simplejson as json
from flask import jsonify
import urllib2
import urllib
#import jsonpath
import time
from app import *
from models import models

TEST_API_KEY = 'f247296fc35c9f7acadb3551b4c612a2'

API_BASE_URL = "http://api.crunchbase.com/"
API_VERSION = "2"
API_URL = API_BASE_URL + "v" + "/" + API_VERSION + "/"

#companies = ["Facebook", "Google", "Apple", "Microsoft", "Yahoo", "Dropbox", "Twitter", "Box", "Amazon", "Linkedin" ]
companies = ["Dropbox", "Facebook", "Pinterest", "Google", "Samsung-Electronics", "Verizon", "GoPro", "Microsoft", "Twitter", "Apple"]

investors = [""]

def __webRequest(url):
    try:
      response = urllib2.urlopen(url)
      result = response.read()
      return result
    except urllib2.HTTPError as e:
      raise Exception

def __getJsonData2(namespace, query=""):
    url = API_URL + namespace + "?user_key=" + TEST_API_KEY + query
    print url
    response_dict = json.loads(__webRequest(url))
    return response_dict

def getOrganizationData(permalink):
    result = __getJsonData2("organization/" + permalink)
    return result

def getCompetitorsData(permalink):
    result = __getJsonData2("organization/" + permalink + "/competitors/")
    return result

def getCategoriesData(permalink):
    result = __getJsonData2("organization/" + permalink + "/categories/")
    return result

def getAcquisitionsData(permalink):
    result = __getJsonData2("organization/" + permalink + "/acquisitions/")
    return result

def getAcquisitionData(path):
    result = __getJsonData2(path)
    return result

def getInvestmentsData(permalink):
    result = __getJsonData2("organization/" + permalink + "/investments/")
    return result

def getProductsData(permalink):
    result = __getJsonData2("organization/" + permalink + "/products/")
    return result

def getFundingRoundData(path):
    result = __getJsonData2(path)
    return result

def getNewsData(permalink):
    result = __getJsonData2("organization/" + permalink + "/news/")
    return result

def getWebsitesData(permalink):
	result = __getJsonData2("organization/" + permalink + "/websites/")
	return result

def getFoundersData(permalink):
    result = __getJsonData2("organization/" + permalink + "/founders/")
    return result

def getAllOrganizations():
    result = __getJsonData2("organizations")
    return result


def createCompany(x):
	#TODO add if statements to find keys (for example: funding_rounds for google and facebook, but funding_round for apple. also, not all companies have the same fields)
	response = getOrganizationData(x)

	#name
	name = (response["data"]["properties"]["name"])

	#homepage_url
	homepage_url = json.dumps(response["data"]["properties"]["homepage_url"])

	#description
	description = json.dumps(response["data"]["properties"]["description"])

	#founded_day
	if (response["data"]["properties"].get("founded_on_day")):
		founded_on_day = json.dumps(response["data"]["properties"]["founded_on_day"])
	else:
		founded_on_day = " "

	#founded_month
	if (response["data"]["properties"].get("founded_on_month")):
		founded_on_month = json.dumps(response["data"]["properties"]["founded_on_month"])
	else:
		founded_on_month = " "

	#founded_year
	if (response["data"]["properties"].get("founded_on_year")):
		founded_on_year = json.dumps(response["data"]["properties"]["founded_on_year"])
	else:
		founded_on_year = " "

	#headquarters
	headquarters = json.dumps(response["data"]["relationships"]["headquarters"]["items"][0]["city"])

#	company = models.Company(uuid=uuid, permalink=permalink, name=name, homepage_url=homepage_url, description=description, founded_day=founded_day, founded_month=founded_month, founded_year=founded_year)
	company = models.Company(name=name, homepage_url=homepage_url, description=description, founded_on_day=founded_on_day, founded_on_month=founded_on_month, founded_on_year=founded_on_year, headquarters=headquarters)

	#founders

	#TODO organize funding_rounds appropriately. it's currently just in json format
#	if (json.dumps(response["data"]["relationships"].get("funding_rounds"))):
#		funding_rounds = json.dumps(response["data"]["relationships"]["funding_rounds"])
#	else:
#		funding_rounds = json.dumps(response["data"]["relationships"]["funding_round"])

	#acquisitions
	#acquisitions = json.dumps(response["data"]["relationships"]["acquisitions"])

	acquisitions_url = json.dumps(response["data"]["relationships"]["acquisitions"]["paging"]["first_page_url"])
	numAcquisitions = int(json.dumps(response["data"]["relationships"]["acquisitions"]["paging"]["total_items"]))
	acquisitions_response = getAcquisitionsData(x)
	acquisitions = list()

	for i in range(0, numAcquisitions):
		time.sleep(3)
		acqui = acquisitions_response["data"]["items"][i]["path"]
		time.sleep(2)
		acquisition_response = getAcquisitionData(acqui)
		acquisitions.append(acquisition_response["data"]["relationships"]["acquiree"]["items"][0]["name"])
		#acquisition = models.Acquisition.(...)



		#get all information about each acquisition
		#get price if possible (data, price)
		#get date announced on (data, announced_on (wether it's year, month, day or all))
		#get path (relationships, acquiree, items[0], path)
		#get news articles (relationships, news, paging, total items or first_page_url)

		#FROM path: get response for acquisition page
		#get information on when it was founded, use this to calculate time elapsed between when it was founded and when it was acquired
		#get founders' information (data, relationships, current_team, items.length, path or first, last name
		#Go to founder's path

		#Get headquarters' location
		#get funding rounds information
		#get categories
		#get its websites, news articles


		#Create acquisition and link it to its acquiring company with its backref in database

	for a in acquisitions:
		company.aq.append(a)

	#competitors
	#extract list of competitors
	if (response["data"]["relationships"].get("competitors")):
		competitors_url = json.dumps(response["data"]["relationships"]["competitors"]["paging"]["first_page_url"])
		numCompetitors = int(json.dumps(response["data"]["relationships"]["competitors"]["paging"]["total_items"]))
		competitors_response = getCompetitorsData(x)
		competitors = list()

		for i in range(0, numCompetitors):
			competitors.append(competitors_response["data"]["items"][i]["name"])

	#categories
	categories_url = json.dumps(response["data"]["relationships"]["categories"]["paging"]["first_page_url"])
	numCategories = int(json.dumps(response["data"]["relationships"]["categories"]["paging"]["total_items"]))
	categories_response = getCategoriesData(x)
	#markets = json.dumps(response["data"]["relationships"].get("markets"))
	categories = list()

	for i in range(0, numCategories):
		categories.append(categories_response["data"]["items"][i]["name"])

	for m in categories:
		print m
		company.ct.append(m)

	#investments
	#investments = json.dumps(response["data"]["relationships"].get("investments"))
	#TODO also pull out investment round for each investment
	"""
	investments_url = json.dumps(response["data"]["relationships"]["investments"]["paging"]["first_page_url"])
	numInvestments = int(json.dumps(response["data"]["relationships"]["investments"]["paging"]["total_items"]))
	investments_response = getInvestmentsData(x)
	investments = list()
	fundingRoundPath = list()
	
	if (investments is not None):
		for i in range(0, numInvestments):
			investments.append(investments_response["data"]["items"][i]["invested_in"]["name"])
			fundingRoundPath.append(investments_response["data"]["items"][i]["funding_round"]["path"])
	"""
	#TODO fix this later, keep out for now
	"""	
		for path in fundingRoundPath:
			if(getFundingRoundData(path)):
				fundingRoundPath_response = getFundingRoundData(path)
				numInvestments = int(json.dumps(fundingRoundPath_response["data"]["relationships"]["investments"]["paging"]["total_items"]))
			#TODO get funding_type, date, name, etc.
	"""

	#founders
	founders = list()
	if (response["data"]["relationships"].get("founders")):
		founders_url = json.dumps(response["data"]["relationships"]["founders"]["paging"]["first_page_url"])
		numFounders = int(json.dumps(response["data"]["relationships"]["founders"]["paging"].get("total_items")))
		founders_response = getFoundersData(x)

		for i in range(0, numFounders):
			founders.append(founders_response["data"]["items"][i]["name"])

		for f in founders:
			company.fd.append(f)

	#TODO now that I have recursive iteration over JSON nested fields working, loop through to find the Products key, then loop through the fields "url" "name" etc within that key to find the below parameters
	#products
	products = list()
	if (response["data"]["relationships"].get("products")):
		products_url = json.dumps(response["data"]["relationships"]["products"]["paging"]["first_page_url"])
		numProducts = int(json.dumps(response["data"]["relationships"]["products"]["paging"]["total_items"]))
		products_response = getProductsData(x)

		for i in range(0, numProducts):
			products.append(products_response["data"]["items"][i]["name"])

		for p in products:
		#	product = models.Product(name=p)
			company.pd.append(p)

	#news (TODO take care of case where numArticles > 1000)
	news = list()
	article_page = json.dumps(response["data"]["relationships"]["news"]["paging"]["first_page_url"])	
	numArticles = int(json.dumps(response["data"]["relationships"]["news"]["paging"]["total_items"]))
	#TODO this is a dirty quick fix. CHANGE SOON
	if (numArticles > 1000):
		numArticles = 999
	news_response = getNewsData(x)

	for i in range(0, numArticles):
		article_url = news_response["data"]["items"][i]["url"]
		article_title = news_response["data"]["items"][i]["title"]
		article_date = news_response["data"]["items"][i]["posted_on"]
		news = models.News(article_title=article_title, article_url=article_url, article_date=article_date, company=company)
		db.session.add(news)
		#db.session.commit()

	#websites
	websites = list()
	wesbites_page = json.dumps(response["data"]["relationships"]["websites"]["paging"]["first_page_url"])
	numWebsites = int(json.dumps(response["data"]["relationships"]["websites"]["paging"]["total_items"]))
	websites_response = getWebsitesData(x)

	for i in range(0, numWebsites):
		website_url = websites_response["data"]["items"][i]["url"]
		website_title = websites_response["data"]["items"][i]["title"]
		website = models.Website(website_title=website_title, website_url=website_url, company=company)
		db.session.add(website)

	#TODO insert functions to access companies (get), delete

	db.session.add(company)
	db.session.commit()


for x in companies:
	createCompany(x)

#for x in investors:
#	createInvestors(x)

users =  models.Company.query.all()
for u in users:
	print u.id, u.name, u.founded_on_year, u.aq
