import random, json
from pathlib import Path

try:
    from game_data import IMAGES_META, IMAGE_LABELS
except Exception:
    # fallback si game_data manquant (durant dev)
    IMAGES_META = {}
    IMAGE_LABELS = {}

# ---------------------- TEST DE VÉRIFICATION ----------------------
print("🔍 Vérification de game_data.py ...")

# Vérifie que chaque image pixelisée a un mapping
for diff, kinds in IMAGES_META.items():
    for kind_name in ["default", "skin"]:
        for pix_name in kinds.get(kind_name, []):
            if pix_name not in IMAGE_LABELS:
                print(f"❌ Pas de mapping pour {pix_name} ({diff}/{kind_name})")

# Vérifie que le fichier pixelisé existe sur disque
for diff, kinds in IMAGES_META.items():
    for kind_name in ["default", "skin"]:
        base_dir = Path("ImagesChampPixel") / ("DefaultChampsPixel" if kind_name=="default" else "SkinChampsPixel") / diff
        for pix_name in kinds.get(kind_name, []):
            pix_path = base_dir / pix_name
            if not pix_path.exists():
                print(f"❌ Fichier pixelisé manquant : {pix_path}")

# Vérifie que le fichier original existe
originals = set(IMAGE_LABELS.values())
for orig_name in originals:
    found = list(Path("ImagesChamps").rglob(orig_name))
    if not found:
        print(f"❌ Fichier original manquant : {orig_name}")

print("✅ Vérification terminée.")
# ------------------------------------------------------------------

    
def get_random_champion(difficulty="easy", include_skins=False):
    if difficulty not in IMAGES_META:
        return json.dumps({"error": f"Difficulté '{difficulty}' introuvable."})

    all_images = IMAGES_META[difficulty]["default"][:]
    if include_skins:
        all_images += IMAGES_META[difficulty].get("skin", [])

    if not all_images:
        return json.dumps({"error": "Aucune image trouvée."})

    chosen = random.choice(all_images)
    champ_name = IMAGE_LABELS.get(chosen, "Inconnu")

    # chemin vers l'image pixelisée
    if chosen in IMAGES_META[difficulty]["default"]:
        image_path = f"ImagesChampPixel/DefaultChampsPixel/{difficulty}/{chosen}"
    else:
        image_path = f"ImagesChampPixel/SkinChampsPixel/{difficulty}/{chosen}"

    # chemin vers l'image non pixelisée correspondante
    if "-default" in champ_name.lower():
        image_soluce = f"ImagesChamps/DefaultChamps/{champ_name}"
    else:
        image_soluce = f"ImagesChamps/SkinChamps/{champ_name}"

    return json.dumps({
        "champion": champ_name.split("-")[0].replace('_', ' ').strip(),
        "image": image_path,
        "image_soluce": image_soluce
    })