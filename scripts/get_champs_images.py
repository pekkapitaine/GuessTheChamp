import os
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO

# URL de la page à scraper
URL = "https://lolmath.net/articles/champion-images/"
# Dossier de sortie
OUTPUT_DIR = "images_download"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Requête HTTP pour récupérer le HTML
response = requests.get(URL)
if response.status_code != 200:
    raise Exception(f"Impossible de récupérer la page: {response.status_code}")
soup = BeautifulSoup(response.text, "html.parser")

# Sélection du conteneur principal
containers = soup.select(".flex.flex-col.gap-y-16 > .flex.flex-col.gap-y-4")

for container in containers:
    # Récupérer le texte du span
    span = container.find("span")
    if not span:
        continue
    print("span found!")
    span_text = span.get_text(strip=True).replace("/", "_").replace("\\", "_").replace(" ", "_")

    name = span_text.rsplit('.', 1)[0]

    # Séparer champ et skin par le "-"
    parts = name.split("-")
    champ = parts[0]  # "Aatrox(Aatrox_266)"
    skin = parts[1] if len(parts) > 1 else "default(0)"  # "default(0)"

    # Nettoyer le nom du champion pour enlever le numéro entre parenthèses
    import re
    champ_clean = re.sub(r"\(.*?\)", "", champ)  # "Aatrox"

    # Nettoyer le skin si besoin
    skin_clean = re.sub(r"\(.*?\)", "", skin)  # "default"

    # Nouveau nom
    filename = f"{champ_clean}-{skin_clean}.png"

    # Récupérer le div contenant les images
    div = container.find("div")
    if not div:
        continue
    print("div found!")
    
    img_tag = div.select_one("picture > source")
    if not img_tag or not img_tag.get("srcset"):
        continue
    print("img_tag found!")
    srcset = img_tag["srcset"].split(",")[0].split()[0]
    
    # Télécharger l'image
    img_response = requests.get(srcset)
    if img_response.status_code != 200:
        print(f"Impossible de télécharger l'image {srcset}")
        continue

    try:
        # Conversion WebP -> PNG
        image = Image.open(BytesIO(img_response.content)).convert("RGBA")
        filepath = os.path.join(OUTPUT_DIR, filename)
        image.save(filepath, "PNG")
        print(f"Téléchargé et converti : {filename}")
    except Exception as e:
        print(f"Erreur lors de la conversion de {srcset}: {e}")
        filepath = os.path.join(OUTPUT_DIR, f"{span_text}.webp")
        with open(filepath, "wb") as f:
            f.write(img_response.content)
        print(f"Téléchargé en WebP : {span_text}.webp")