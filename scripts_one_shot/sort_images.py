import os
import shutil

# Dossier contenant les images existantes
SOURCE_DIR = "images_download"
# Dossier où déplacer les "default"
TARGET_DIR = "DefaultChamps"

os.makedirs(TARGET_DIR, exist_ok=True)

# Parcours des fichiers du dossier source
for filename in os.listdir(SOURCE_DIR):
    # Vérifie que c'est un fichier image
    if not (filename.lower().endswith(".png") or filename.lower().endswith(".webp")):
        continue

    # Si le nom contient "default" (insensible à la casse)
    if "default" in filename.lower():
        source_path = os.path.join(SOURCE_DIR, filename)
        target_path = os.path.join(TARGET_DIR, filename)
        shutil.move(source_path, target_path)
        print(f"Déplacé : {filename}")