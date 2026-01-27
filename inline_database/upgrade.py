import json
import pathlib
import urllib.request

class ModJsonFile:
    def __init__(self) -> None:
        self.id = -1

        self.names : dict[str,str | None] = {}
        self.summmaries : dict[str,str | None] = {}
        self.descriptions : dict[str,str | None] = {}
        self.translates : dict[str,str | None] = {}

    def read_from_path(self, path:pathlib.Path):
        with path.open('r', encoding='utf8') as f:
            dat = json.loads(f.read())
        self.id = dat['id']
        self.names = dat['names']
        self.summmaries = dat['summmaries']
        self.descriptions = dat['descriptions']
        self.translates = dat['translates']

    def merge_from_json(self, json):
        self.id = json['id']
        if not json["name"] in self.names:
            self.names[json["name"]] = None
        
        if json["summary"] == json["description"]:
            txt = json["summary"]
            if not ((txt in self.summmaries and txt in self.descriptions) or txt in self.translates):
                self.translates[txt] = None
        else:
            if not json["summary"] in self.summmaries:
                self.summmaries[json["summary"]] = None
            if not json["description"] in self.descriptions:
                self.descriptions[json["description"]] = None
    def to_json_object(self):
        return {
                "id":self.id,
                "names":self.names,
                "summmaries":self.summmaries,
                "descriptions":self.descriptions,
                "translates":self.translates
            }
    def write_storage(self):
        folder = pathlib.Path(__file__).parent / 'storage' / 'mods'
        folder.mkdir(parents=True, exist_ok=True)

        with (folder / f'{self.id}.json').open('w',encoding='utf8') as f:
            f.write(json.dumps(self.to_json_object(), indent=4, ensure_ascii=False))

storage:dict[int,ModJsonFile] = dict()

def read_storage():
    for f in (pathlib.Path(__file__).parent / 'storage'/'mods').glob("*.json"):
        file = ModJsonFile()
        file.read_from_path(f)
        storage[file.id] = file

def fetch_mod_info(mod):
    key = mod['id']
    if key in storage:
        item = storage[key]
    else:
        item = ModJsonFile()
        storage[key] = item
    item.merge_from_json(mod)

def fetch_mods_to_storage(url:str):
    data = urllib.request.urlopen(url).read().decode("utf-8")
    jsondata = json.loads(data)
    for mod in jsondata['mods']:
        fetch_mod_info(mod['mod'])
def write_to_storage():
    for k in storage:
        storage[k].write_storage()

read_storage()
# fetch_mods_to_storage("https://beatmods.com/api/mods?gameName=BeatSaber&gameVersion=1.40.8&status=verified&platform=universalpc")
fetch_mods_to_storage("https://beatmods.com/api/mods?gameName=BeatSaber&status=verified")
write_to_storage()

# write to source

source_file = pathlib.Path(__file__).parent / '..' / 'src' / 'generated_inline_db.json'
with source_file.open("w",encoding='utf8') as f:
    mods_storage = {}
    for k in storage:
        mods_storage[k] = storage[k].to_json_object()
    f.write(json.dumps({
        "mods": mods_storage 
    }))