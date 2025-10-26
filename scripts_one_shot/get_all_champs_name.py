import requests
from bs4 import BeautifulSoup
import json

url = "https://darkintaqt.com/blog/champ-ids"
resp = requests.get(url)
resp.raise_for_status()
soup = BeautifulSoup(resp.text, "html.parser")

champions = []
# trouver la table
table = soup.find("table")
if not table:
    raise RuntimeError("Table non trouvée sur la page")

tbody = table.find("tbody")
if not tbody:
    rows = table.find_all("tr")
else:
    rows = tbody.find_all("tr")

for tr in rows:
    cells = tr.find_all("td")
    if len(cells) >= 4:
        name = cells[3].get_text(strip=True)
        champions.append(name)

# pour vérifier
print(champions[:10])

# sauvegarder dans un fichier JSON
with open("champions_list.json", "w", encoding="utf-8") as f:
    json.dump(champions, f, ensure_ascii=False, indent=2)

print("✅ JSON sauvegardé : champions_list.json")
