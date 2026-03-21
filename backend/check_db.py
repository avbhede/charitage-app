from pymongo import MongoClient

c = MongoClient('mongodb://localhost:27017')
db = c['charitage']

print("=== DONATIONS ===")
for d in db.donations.find({}, {'_id': 0}):
    print(d)

print()
print("=== CAMPAIGNS ===")
for camp in db.campaigns.find({}, {'_id': 0, 'description': 0}):
    print(camp)

c.close()
