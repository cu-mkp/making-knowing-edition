export default {
    entryManifestURL: `${process.env.REACT_APP_EDITION_DATA_URL}/entries.json`,
    entries: null,
    entryList: null,
    filterTags: [],
    tagNameMap: { 
        "animal": "animal",
        "body_part": "body part",
        "currency": "currency",
        "definition": "definition",
        "environment": "environment",
        "material": "material",
        "medical": "medical",
        "measurement": "measurement",
        "music": "music",
        "plant": "plant",
        "place":  "place",
        "personal_name": "personal name",
        "profession":  "profession",
        "sensory": "sensory",
        "tool": "tool",
        "time": "time",
        "weapon": "weapon" 
    },
    loaded: false
}	