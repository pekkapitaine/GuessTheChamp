import os
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO

# URL de la page contenant les icônes HD
url1 = "https://wiki.leagueoflegends.com/en-us/Category:High_definition_item_icons?fileuntil=Runaan%27s+Hurricane+item+HD.png#mw-category-media"
url2 = "https://wiki.leagueoflegends.com/en-us/Category:High_definition_item_icons?filefrom=Runaan%27s+Hurricane+item+HD.png#mw-category-media"

# Dossier de sortie
OUTPUT_DIR = "ImagesItems"
os.makedirs(OUTPUT_DIR, exist_ok=True)
for url in [url1,url2]:
# Récupération de la page HTML
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Impossible de récupérer la page: {response.status_code}")

    soup = BeautifulSoup(response.text, "html.parser")

    # Sélectionne toutes les images dans les conteneurs de galerie
    containers = soup.select(".gallerybox")

    for container in containers:
        image = container.find("img")
        if not image:
            continue

        # URL complète de l'image
        img_url = "https://wiki.leagueoflegends.com" + image["src"]

        # Nom du fichier
        filename_tag = container.find("a", class_="galleryfilename galleryfilename-truncate")
        if not filename_tag:
            continue

        filename = filename_tag.text.strip().replace(" ", "_")
        if not filename.lower().endswith(".png"):
            filename += ".png"

        filepath = os.path.join(OUTPUT_DIR, filename)

        # Téléchargement et sauvegarde
        print(f"Téléchargement de {filename}...")
        img_data = requests.get(img_url).content
        Image.open(BytesIO(img_data)).save(filepath)

print("✅ Téléchargement terminé !")
