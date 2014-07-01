#import simplejson as json
import json
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
companies = ["Facebook", "Pinterest", "Google", "Samsung-Electronics", "Verizon", "GoPro", "Microsoft", "Twitter", "Apple"]
#companies = ["Dropbox"]

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

def __getJsonData3(namespace, query=""):
	url = namespace + "?user_key=" + TEST_API_KEY + query
	print url
	response_dict = json.loads(__webRequest(url))
	return response_dict

def getOrganizationData(permalink):
    result = __getJsonData2("organization/" + permalink)
    return result

def getCompetitorsData(permalink):
    result = __getJsonData2("organization/" + permalink + "/competitors/")
    return result

def getCompetitorsAqData(permalink):
	result = __getJsonData2(permalink + "/competitors")
	return result

def getCategoriesData(permalink):
    result = __getJsonData2("organization/" + permalink + "/categories/")
    return result

def getAcquisitionCategoriesData(path):
	result = __getJsonData2(path + "/categories/")
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

def getInvestmentData(path):
	result = __getJsonData3(path)
	return result

def getProductsData(permalink):
    result = __getJsonData2("organization/" + permalink + "/products/")
    return result

def getProductsAqData(permalink):
	result = __getJsonData2(permalink + "/products")
	return result

def getFundingRoundsData(permalink):
    result = __getJsonData2("organization/" + permalink + "/funding_rounds")
    return result

def getFundingRoundsAqData(permalink):
	result = __getJsonData2(permalink + "/funding_rounds")
	return result

def getFundingRoundData(path):
	result = __getJsonData2(path)
	return result

def getNewsData(permalink):
    result = __getJsonData2("organization/" + permalink + "/news/")
    return result

def getNewsAqData(permalink):
	result = __getJsonData2(permalink + "/news")
	return result

def getWebsitesData(permalink):
	result = __getJsonData2("organization/" + permalink + "/websites/")
	return result

def getWebsiteData(path):
	result = __getJsonData3(path)
	return result

def getFoundersData(permalink):
    result = __getJsonData2("organization/" + permalink + "/founders/")
    return result

def getFounderData(path):
	result = __getJsonData3(path)
	return result

def getPersonData(path):
	result = __getJsonData2(path)
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
		founded_on_day = "0"

	#founded_month
	if (response["data"]["properties"].get("founded_on_month")):
		founded_on_month = json.dumps(response["data"]["properties"]["founded_on_month"])
	else:
		founded_on_month = "0"

	#founded_year
	if (response["data"]["properties"].get("founded_on_year")):
		founded_on_year = json.dumps(response["data"]["properties"]["founded_on_year"])
	else:
		founded_on_year = "0"

	#number_of_employees
	if (response["data"]["properties"].get("number_of_employees")):
		number_of_employees = json.dumps(response["data"]["properties"]["number_of_employees"])
	else:
		number_of_employees = "0"	

	#number_of_investments
	if (response["data"]["properties"].get("number_of_investments")):
		number_of_investments = json.dumps(response["data"]["properties"]["number_of_investments"])
	else:
		number_of_investments = "0"	

	#total_funding_usd
	if (response["data"]["properties"].get("total_funding_usd")):
		total_funding_usd = json.dumps(response["data"]["properties"]["total_funding_usd"])
	else:
		total_funding_usd = "0"

	#number_of_funding_rounds
	if (response["data"]["relationships"].get("funding_rounds")):
		number_of_funding_rounds = response["data"]["relationships"]["funding_rounds"]["paging"]["total_items"]
	else:
		number_of_funding_rounds = "0"

	#headquarters
	headquarters = response["data"]["relationships"]["headquarters"]["items"][0]["city"]

#	company = models.Company(uuid=uuid, permalink=permalink, name=name, homepage_url=homepage_url, description=description, founded_day=founded_day, founded_month=founded_month, founded_year=founded_year)
	company = models.Company(name=name, homepage_url=homepage_url, description=description, founded_on_day=founded_on_day, founded_on_month=founded_on_month, founded_on_year=founded_on_year, headquarters=headquarters, number_of_employees=number_of_employees, number_of_investments=number_of_investments, total_funding_usd=total_funding_usd, number_of_funding_rounds=number_of_funding_rounds)

	#competitors
	#extract list of competitors
	if (response["data"]["relationships"].get("competitors")):
		competitors_url = json.dumps(response["data"]["relationships"]["competitors"]["paging"]["first_page_url"])
		numCompetitors = int(json.dumps(response["data"]["relationships"]["competitors"]["paging"]["total_items"]))
		competitors_response = getCompetitorsData(x)
		competitors = list()

		for i in range(0, numCompetitors):
			competitors.append(competitors_response["data"]["items"][i]["name"])

		for c in competitors:
			competitor = models.Competitor(name=c, company=company)
			db.session.add(competitor)
			#company.cp.append(c)


	#TODO now that I have recursive iteration over JSON nested fields working, loop through to find the Products key, then loop through the fields "url" "name" etc within that key to find the below parameters
	#products
	products = list()
	if (response["data"]["relationships"].get("products")):
		products_url = json.dumps(response["data"]["relationships"]["products"]["paging"]["first_page_url"])
		numProducts = int(json.dumps(response["data"]["relationships"]["products"]["paging"]["total_items"]))
		products_response = getProductsData(x)

		for i in range(0, numProducts):
			products.append(products_response["data"]["items"][i]["name"])
			product_name = products_response["data"]["items"][i]["name"]
			#product = models.product(name=product_name)

		for p in products:
			product = models.Product(name=p, company=company)
			db.session.add(product)
		#	product = models.Product(name=p)
			#company.pd.append(p)

	#categories
	categories_url = json.dumps(response["data"]["relationships"]["categories"]["paging"]["first_page_url"])
	numCategories = int(json.dumps(response["data"]["relationships"]["categories"]["paging"]["total_items"]))
	categories_response = getCategoriesData(x)
	#markets = json.dumps(response["data"]["relationships"].get("markets"))
	categories = list()

	for i in range(0, numCategories):
		categories.append(categories_response["data"]["items"][i]["name"])

	for m in categories:
		category = models.Category(name=m, company=company)
		db.session.add(category)
		#company.ct.append(m)

	#founders
	founders = list()
	if (response["data"]["relationships"].get("founders")):
		founders_url = json.dumps(response["data"]["relationships"]["founders"]["paging"]["first_page_url"])
		numFounders = int(json.dumps(response["data"]["relationships"]["founders"]["paging"].get("total_items")))
		founders_response = getFoundersData(x)

		for i in range(0, numFounders):
			founders.append(founders_response["data"]["items"][i]["name"])

		#founder education
		for i in range(0, numFounders):
			founder_path = founders_response["data"]["items"][i]["path"]
			time.sleep(2)
			founder_response = getPersonData(founder_path)
			if (founder_response["data"]["relationships"].get("degrees")):
				founder_education = founder_response["data"]["relationships"]["degrees"]["items"][0]["organization_name"]
				founder_name = founders[i]
				founder = models.Founder(name = founder_name, education = founder_education, company = company)
				db.session.add(founder)

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

	#funding rounds
	if (response["data"]["relationships"].get("funding_rounds")):
		numFundingRounds = response["data"]["relationships"]["funding_rounds"]["paging"]["total_items"]
		funding_rounds_url = response["data"]["relationships"]["funding_rounds"]["paging"]["first_page_url"]
		funding_rounds_response = getFundingRoundsData(x)

		for i in range(0, numFundingRounds):
			time.sleep(2)
			funding_round_path = funding_rounds_response["data"]["items"][i]["path"]
			funding_round_response = getFundingRoundData(funding_round_path)

			funding_type = funding_round_response["data"]["properties"]["funding_type"]
			day_announced = funding_round_response["data"]["properties"]["announced_on_day"]
			month_announced = funding_round_response["data"]["properties"]["announced_on_month"]
			year_announced = funding_round_response["data"]["properties"]["announced_on_year"]
			amount_raised = funding_round_response["data"]["properties"]["money_raised"]
			if (funding_round_response["data"]["relationships"].get("investments")):
				num_investors = funding_round_response["data"]["relationships"]["investments"]["paging"]["total_items"]

				investment_page = funding_round_response["data"]["relationships"]["investments"]["paging"]["first_page_url"]
				time.sleep(2)
				investment_response = getInvestmentData(investment_page)

				for j in range (0, num_investors):
					if (investment_response["data"]["items"][j]["investor"].get("name")):
						investor = investment_response["data"]["items"][j]["investor"]["name"]
						investor_type = investment_response["data"]["items"][j]["investor"]["type"]
						investor = models.Investor(name = investor, company=company)



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


	#investors

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

		#acquisition_day
		acquisition_day = acquisition_response["data"]["properties"]["announced_on_day"]

		#acquisition_month
		acquisition_month = acquisition_response["data"]["properties"]["announced_on_month"]

		#acquisition_year
		acquisition_year = acquisition_response["data"]["properties"]["announced_on_year"]

		#add acquisition price if it exists
		if (acquisition_response["data"]["properties"].get("price")):
			acquisition_price = acquisition_response["data"]["properties"].get("price")
		else:
			acquisition_price = "0"

		acquisitions.append(acquisition_response["data"]["relationships"]["acquiree"]["items"][0]["name"])
		acquisition_page = getAcquisitionData(acquisition_response["data"]["relationships"]["acquiree"]["items"][0]["path"])

		#name
		name = acquisition_page["data"]["properties"]["name"]

		#homepage_url
		if (acquisition_page["data"]["properties"].get("homepage_url")):
			homepage_url = acquisition_page["data"]["properties"]["homepage_url"]
		else:
			homepage_url = "0"

		#description
		if (acquisition_page["data"]["properties"].get("description")):
			description = acquisition_page["data"]["properties"]["description"]
		else:
			description = "0"

		#founded_day
		if (acquisition_page["data"]["properties"].get("founded_on_day")):
			founded_on_day = json.dumps(acquisition_page["data"]["properties"]["founded_on_day"])
		else:
			founded_on_day = "0"

		#founded_month
		if (acquisition_page["data"]["properties"].get("founded_on_month")):
			founded_on_month = json.dumps(acquisition_page["data"]["properties"]["founded_on_month"])
		else:
			founded_on_month = "0"

		#founded_year
		if (acquisition_page["data"]["properties"].get("founded_on_year")):
			founded_on_year = json.dumps(acquisition_page["data"]["properties"]["founded_on_year"])
		else:
			founded_on_year = "0"

		#headquarters
		if (acquisition_page["data"]["relationships"].get("headquarters")):
			headquarters = acquisition_page["data"]["relationships"]["headquarters"]["items"][0]["city"]
		else:
			headquarters = "0"

		#number_of_employees
		if (acquisition_page["data"]["properties"].get("number_of_employees")):
			number_of_employees = acquisition_page["data"]["properties"]["number_of_employees"]
		else:
			number_of_employees = "0"

		#number_of_funding_rounds
		if (acquisition_page["data"]["relationships"].get("funding_rounds")):
			number_of_funding_rounds = acquisition_page["data"]["relationships"]["funding_rounds"]["paging"]["total_items"]
		else:
			number_of_funding_rounds = "0"

		#total_funding_usd
		total_funding_usd = json.dumps(acquisition_page["data"]["properties"]["total_funding_usd"])

		#number_of_investments
		number_of_investments = acquisition_page["data"]["properties"]["number_of_investments"]

		#acquisition = models.Acquisition.(...)
		acquisition = models.Acquisition(name=name, acquisition_day=acquisition_day, acquisition_month=acquisition_month, acquisition_year=acquisition_year, founded_on_day=founded_on_day, founded_on_month=founded_on_month, founded_on_year=founded_on_year, headquarters=headquarters, number_of_employees=number_of_employees, homepage_url=homepage_url, number_of_investments=number_of_investments, description=description, total_funding_usd=total_funding_usd, number_of_funding_rounds=number_of_funding_rounds, acquirer=company)

		#funding rounds

		#investors

		#categories
		if (acquisition_page["data"]["relationships"].get("categories")):
			categories_aq_url = json.dumps(acquisition_page["data"]["relationships"]["categories"]["paging"]["first_page_url"])
			numCategories_aq = int(json.dumps(acquisition_page["data"]["relationships"]["categories"]["paging"]["total_items"]))
			categories_aq_response = getAcquisitionCategoriesData(acquisition_response["data"]["relationships"]["acquiree"]["items"][0]["path"])
			#markets = json.dumps(response["data"]["relationships"].get("markets"))
			categories_aq = list()

			for i in range(0, numCategories_aq):
				categories_aq.append(categories_aq_response["data"]["items"][i]["name"])

			for m in categories_aq:
				category = models.Category(name=m, acquisition=acquisition)
				#acquisition.ct_aq.append(m)
		else:
			pass
		#add rest of acquisition relationships here}

		time.sleep(3)

		#founders
		founders = list()
		if (acquisition_page["data"]["relationships"].get("founders")):
			founders_url = json.dumps(acquisition_page["data"]["relationships"]["founders"]["paging"]["first_page_url"])
			numFounders = int(json.dumps(acquisition_page["data"]["relationships"]["founders"]["paging"].get("total_items")))
			founders_response = getFounderData(acquisition_page["data"]["relationships"]["founders"]["paging"]["first_page_url"])

			for i in range(0, numFounders):
				founders.append(founders_response["data"]["items"][i]["name"])

#			for f in founders:
#				#get education
#				founder = models.Founder(name=f, acquisition=acquisition)
#				db.session.add(founder)
				#company.fd.append(f)

			#founder education
			for i in range(0, numFounders):
				founder_path = founders_response["data"]["items"][i]["path"]
				time.sleep(2)
				founder_response = getPersonData(founder_path)
				if (founder_response["data"]["relationships"].get("degrees")):
					founder_education = founder_response["data"]["relationships"]["degrees"]["items"][0]["organization_name"]
					founder_name = founders[i]
					founder = models.Founder(name = founder_name, education = founder_education, acquisition = acquisition)
					db.session.add(founder)

		time.sleep(3)

		#funding rounds
		if (acquisition_page["data"]["relationships"].get("funding_rounds")):
			numFundingRounds = acquisition_page["data"]["relationships"]["funding_rounds"]["paging"]["total_items"]
			funding_rounds_url = acquisition_page["data"]["relationships"]["funding_rounds"]["paging"]["first_page_url"]
			funding_rounds_response = getFundingRoundsAqData(acquisition_response["data"]["relationships"]["acquiree"]["items"][0]["path"])

			for i in range(0, numFundingRounds):
				funding_round_path = funding_rounds_response["data"]["items"][i]["path"]
				time.sleep(2)
				funding_round_response = getFundingRoundData(funding_round_path)

				funding_type = funding_round_response["data"]["properties"]["funding_type"]
				day_announced = funding_round_response["data"]["properties"]["announced_on_day"]
				month_announced = funding_round_response["data"]["properties"]["announced_on_month"]
				year_announced = funding_round_response["data"]["properties"]["announced_on_year"]
				if(funding_round_response["data"]["properties"].get("money_raised")):
					amount_raised = funding_round_response["data"]["properties"]["money_raised"]
				else:
					amount_raised = "0"
				if (funding_round_response["data"]["relationships"].get("investments")):
					num_investors = funding_round_response["data"]["relationships"]["investments"]["paging"]["total_items"]
					investment_page = funding_round_response["data"]["relationships"]["investments"]["paging"]["first_page_url"]
					investment_response = getInvestmentData(investment_page)

					for j in range (0, num_investors):
						if (investment_response["data"]["items"][j]["investor"].get("name")):
							investor = investment_response["data"]["items"][j]["investor"]["name"]
							investor_type = investment_response["data"]["items"][j]["investor"]["type"]
							investor = models.Investor(name = investor, acquisition=acquisition)
							db.session.add(investor)
						elif(investment_response["data"]["items"][j]["investor"].get("first_name")):
							investor = investment_response["data"]["items"][j]["investor"]["first_name"] + " " + investment_response["data"]["items"][j]["investor"]["last_name"]
							investor_type = investment_response["data"]["items"][j]["investor"]["type"]
							investor = models.Investor(name = investor, acquisition=acquisition)
							db.session.add(investor)

			time.sleep(3)

		#competitors
		if (acquisition_page["data"]["relationships"].get("competitors")):
			competitors_url = json.dumps(acquisition_page["data"]["relationships"]["competitors"]["paging"]["first_page_url"])
			numCompetitors = int(json.dumps(acquisition_page["data"]["relationships"]["competitors"]["paging"]["total_items"]))
			competitors_response = getCompetitorsAqData(acquisition_response["data"]["relationships"]["acquiree"]["items"][0]["path"])
			competitors = list()

			for i in range(0, numCompetitors):
				competitors.append(competitors_response["data"]["items"][i]["name"])

			for c in competitors:
				competitor = models.Competitor(name=c, acquisition=acquisition)
				db.session.add(competitor)

		time.sleep(3)

		#products
		products = list()
		if (acquisition_page["data"]["relationships"].get("products")):
			products_url = json.dumps(acquisition_page["data"]["relationships"]["products"]["paging"]["first_page_url"])
			numProducts = int(json.dumps(acquisition_page["data"]["relationships"]["products"]["paging"]["total_items"]))
			products_response = getProductsAqData(acquisition_response["data"]["relationships"]["acquiree"]["items"][0]["path"])

			for i in range(0, numProducts):
				products.append(products_response["data"]["items"][i]["name"])
				product_name = products_response["data"]["items"][i]["name"]
				#product = models.product(name=product_name)

			for p in products:
				product = models.Product(name=p, acquisition=acquisition)
				db.session.add(product)

		time.sleep(3)

		#news (TODO take care of case where numArticles > 1000)
		news = list()
		if (acquisition_page["data"]["relationships"].get("news")):
			article_page = json.dumps(acquisition_page["data"]["relationships"]["news"]["paging"]["first_page_url"])	
			numArticles = int(json.dumps(acquisition_page["data"]["relationships"]["news"]["paging"]["total_items"]))
			#TODO this is a dirty quick fix. CHANGE SOON
			if (numArticles > 1000):
				numArticles = 999
			news_response = getNewsAqData(acquisition_response["data"]["relationships"]["acquiree"]["items"][0]["path"])

			for i in range(0, numArticles):
				article_url = news_response["data"]["items"][i]["url"]
				article_title = news_response["data"]["items"][i]["title"]
				article_date = news_response["data"]["items"][i]["posted_on"]
				news = models.News(article_title=article_title, article_url=article_url, article_date=article_date, acquisition=acquisition)
				db.session.add(news)
			#db.session.commit()

		time.sleep(3)

		#websites
		websites = list()
		if (acquisition_page["data"]["relationships"].get("websites")):
			websites_page = acquisition_page["data"]["relationships"]["websites"]["paging"]["first_page_url"]
			numWebsites = int(json.dumps(acquisition_page["data"]["relationships"]["websites"]["paging"]["total_items"]))
			websites_response = getWebsiteData(websites_page)

			for i in range(0, numWebsites):
				website_url = websites_response["data"]["items"][i]["url"]
				website_title = websites_response["data"]["items"][i]["title"]
				website = models.Website(website_title=website_title, website_url=website_url, acquisition=acquisition)
				db.session.add(website)

		db.session.add(acquisition)
			#db.session.commit()

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

#	for a in acquisitions:
#		company.aq.append(a)

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
