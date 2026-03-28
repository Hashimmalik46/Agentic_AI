import json

with open("data.json", "r") as file:
    data = json.load(file)

def cleaned_data(item):
    name = item.get("name", "")
    name = name.strip() if name else None

    phone = item.get("phone", "")
    if phone:
        phone = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        phone = phone.replace("+", "")
    else:
        phone = None

    website = item.get("website", "")
    if website:
        website = website.strip()

        if not website.startswith("http"):
            website = "https://" + website

        website = website.replace("http://", "https://")

        if website.endswith("/"):
            website = website[:-1]
    else:
        website = None

    rating = item.get("rating")
    try:
        rating = float(rating)
    except:
        rating = None

    return {
        "name": name,
        "phone": phone,
        "website": website,
        "rating": rating,
    }
for item in data:
    clean_items = cleaned_data(item)
    
    if clean_items:
        print(clean_items) 