# build_rename_and_embed.py
import os, json, zlib, base64
from pathlib import Path

# ---------------------------
# PATHS
# ---------------------------
BASE_PIXEL = Path("ImagesChampPixel")
DEFAULT_PIXEL = BASE_PIXEL / "DefaultChampsPixel"
SKIN_PIXEL = BASE_PIXEL / "SkinChampsPixel"
DEFAULT_ORIGINAL = Path("ImagesChamps") / "DefaultChamps"
SKIN_ORIGINAL = Path("ImagesChamps") / "SkinChamps"

# ---------------------------
# VARIABLES DE STOCKAGE
# ---------------------------
mapping = {}  # pixelisé -> original
meta = {}     # difficulté -> { default: [...], skin: [...] }

# ---------------------------
# FONCTION UTILE
# ---------------------------
def list_images(path):
    exts = (".png", ".jpg", ".jpeg", ".webp")
    return sorted([f for f in path.iterdir() if f.is_file() and f.suffix.lower() in exts])

# ---------------------------
# PARCOURS DES DOSSIERS PIXELISÉS
# ---------------------------
for kind_pixel, kind_name, base_original in [
    (DEFAULT_PIXEL, "default", DEFAULT_ORIGINAL),
    (SKIN_PIXEL, "skin", SKIN_ORIGINAL)
]:
    original_files = list_images(base_original)
    if not original_files:
        raise FileNotFoundError(f"❌ Aucun fichier original trouvé dans {base_original}")

    for difficulty_dir in kind_pixel.iterdir():  # easy, medium, hard, extreme
        if not difficulty_dir.is_dir():
            continue
        diff = difficulty_dir.name
        meta.setdefault(diff, {"default": [], "skin": []})
        pixel_files = list_images(difficulty_dir)

        if len(pixel_files) != len(original_files):
            print(f"⚠️ {kind_name}/{diff} : {len(pixel_files)} pixelisés vs {len(original_files)} originaux. On map par ordre.")

        # On map pixelisé → original par index (modulo si nécessaire)
        for i, pix_file in enumerate(pixel_files):
            orig_file = original_files[i % len(original_files)]
            new_name = f"{len(mapping)+1:06d}{pix_file.suffix.lower()}"
            new_path = pix_file.parent / new_name
            pix_file.rename(new_path)

            mapping[new_name] = orig_file.name
            meta[diff][kind_name].append(new_name)

# ---------------------------
# SAUVEGARDE DU MAPPING
# ---------------------------
with open("image_mapping_backup.json", "w", encoding="utf-8") as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)

# ---------------------------
# GENERATION DU MODULE PYTHON EMBED
# ---------------------------
payload = {"meta": meta, "mapping": mapping}
raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
compressed = zlib.compress(raw)
b64 = base64.b64encode(compressed).decode("ascii")

game_data = f'''# Generated file: game_data.py
import base64, zlib, json
_data_b64 = "{b64}"
_payload = zlib.decompress(base64.b64decode(_data_b64)).decode("utf-8")
PAYLOAD = json.loads(_payload)
# convenience
IMAGES_META = PAYLOAD["meta"]
IMAGE_LABELS = PAYLOAD["mapping"]
'''

with open("game_data.py", "w", encoding="utf-8") as f:
    f.write(game_data)

print("✅ Build terminé — game_data.py généré, image_mapping_backup.json sauvegardé.")
