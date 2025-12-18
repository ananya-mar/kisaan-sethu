import sys
import json
from ultralytics import YOLO
from collections import defaultdict
from pathlib import Path
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "best.pt"

def normalize_image(path):
    path = Path(path)
    if path.suffix.lower() == ".jfif":
        img = Image.open(path)
        new_path = path.with_suffix(".jpg")
        img.convert("RGB").save(new_path, "JPEG")
        return str(new_path)
    return str(path)

def detect(image_path):
    model = YOLO(str(MODEL_PATH))

    image_path = normalize_image(image_path)
    results = model(image_path, device="cpu", verbose=False)

    counts = defaultdict(int)
    confs = defaultdict(list)

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            conf = float(box.conf[0])

            counts[label] += 1
            confs[label].append(conf)

    output = []
    for pest, count in counts.items():
        avg_conf = round(sum(confs[pest]) / len(confs[pest]), 2)
        output.append({
            "pest": pest,
            "count": count,
            "avg_confidence": avg_conf
        })


    return output

if __name__ == "__main__":
    try:
        image_path = sys.argv[1]
        result = detect(image_path)

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))
