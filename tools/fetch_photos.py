"""Add up to 4 photos per listing to master.json. Run on your own computer (needs internet):
    python3 tools/fetch_photos.py
Then run ./publish.sh. Not tested from the dev machine: unegui.mn blocked it, so check the first few results."""
import json, re, time, urllib.request, pathlib
P = pathlib.Path(__file__).resolve().parent.parent / "master.json"
d = json.loads(P.read_text(encoding="utf-8"))
pat = re.compile(r'https://cdn\d*\.unegui\.mn/media/[^"\'\\\s<>]+\.(?:webp|jpg|jpeg|png)')
for n, x in enumerate(d["items"], 1):
    if len(x.get("imgs", [])) >= 3 or not x.get("u"): continue
    try:
        html = urllib.request.urlopen(urllib.request.Request(x["u"], headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read().decode("utf-8", "ignore")
        urls = list(dict.fromkeys(([x["i"]] if x.get("i") else []) + pat.findall(html)))[:4]
        x["imgs"] = urls; print(n, x["id"], len(urls))
    except Exception as e:
        print(n, x["id"], "failed", e)
    time.sleep(1)
P.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
