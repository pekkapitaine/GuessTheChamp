import json
import re
import os

# === Chargement du JSON d'origine ===
json_path = "C:/Users/gabri/Documents/projet_dev_personnel/GuessTheChamp/items_translation.json"
images_dir = "C:/Users/gabri/Documents/projet_dev_personnel/GuessTheChamp/ImagesItems"

with open(json_path, "r", encoding="utf-8") as f:
    original_data = json.load(f)

# === Transformation + renommage ===
new_data = {}

for old_filename, item_name in original_data.items():
    # Retirer les apostrophes
    clean_name = item_name.replace("'", "").replace("’", "")
    # Remplacer espaces et caractères spéciaux
    clean_name = re.sub(r"[^a-zA-Z0-9_éèàùçÉÈÀÙÇ]", "_", clean_name)
    # Remplacer les espaces par des underscores
    clean_name = clean_name.replace(" ", "_")
    # Supprimer doublons d'underscores
    clean_name = re.sub(r"_+", "_", clean_name)
    # Ajouter extension .png
    new_filename = f"{clean_name}.png"

    # Ajouter au nouveau dictionnaire
    new_data[new_filename] = item_name

    # === Renommer le fichier si présent ===
    old_path = os.path.join(images_dir, old_filename)
    new_path = os.path.join(images_dir, new_filename)

    if os.path.exists(old_path):
        # Éviter de renommer si c’est déjà fait
        if old_path != new_path:
            try:
                os.rename(old_path, new_path)
                print(f"✅ {old_filename} → {new_filename}")
            except Exception as e:
                print(f"❌ Erreur lors du renommage de {old_filename} : {e}")
        else:
            print(f"ℹ️ Déjà renommé : {old_filename}")
    else:
        print(f"⚠️ Fichier introuvable : {old_filename}")

# === Sauvegarde du nouveau JSON ===
output_json = os.path.join(os.path.dirname(json_path), "items_renamed.json")
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

print("\n✅ Fichier 'items_renamed.json' généré avec succès.")
