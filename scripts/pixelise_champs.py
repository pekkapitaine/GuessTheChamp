import os
from PIL import Image

# Dossiers
SOURCE_DIR = "ImagesChamps/DefaultChamps"
TARGET_DIR = "ImagesChampPixel/DefaultChampsPixel"

SKINS_SOURCE_DIR = "ImagesChamps/SkinChamps"
SKINS_TARGET_DIR = "ImagesChampPixel/SkinChampsPixel"

# Niveaux de difficulté et pixel_size correspondant
DIFFICULTIES = {
    "easy": 20,
    "medium": 33,
    "hard": 46,
    "extreme": 59
}

SKINS_DIFFICULTIES = {
    "easy": 10,
    "medium": 15,
    "hard": 22,
    "extreme": 30
}

for (source,target,difficulty) in [(SOURCE_DIR, TARGET_DIR, DIFFICULTIES), (SKINS_SOURCE_DIR, SKINS_TARGET_DIR, SKINS_DIFFICULTIES)]:

    # Crée les dossiers si inexistants
    for level in difficulty.keys():
        os.makedirs(os.path.join(target, level), exist_ok=True)

    def pixelize_image(input_path, output_path, pixel_size):
        img = Image.open(input_path)
        # Réduire l'image
        small = img.resize(
            (max(1, img.width // pixel_size), max(1, img.height // pixel_size)), 
            resample=Image.NEAREST
        )
        # Re-agrandir pour effet pixelisé
        result = small.resize(img.size, Image.NEAREST)
        result.save(output_path)
        print(f"[{pixel_size}] {output_path} créé")

    # Parcours des images source
    for filename in os.listdir(source):
        if not filename.lower().endswith(".png"):
            continue
        input_path = os.path.join(source, filename)
        name, ext = os.path.splitext(filename)
        
        for level, px_size in difficulty.items():
            output_path = os.path.join(target, level, f"{name}.png")
            pixelize_image(input_path, output_path, px_size)
