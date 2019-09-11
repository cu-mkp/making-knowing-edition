export default {
    entryManifestURL: `${process.env.REACT_APP_EDITION_DATA_URL}/entries.json`,
    entries: null,
    entryList: null,
    filterTags: [],
    tagNameMap: {
        "al": "animal",
        "bp": "bodypart",
        "cn": "currency",
        "env": "environment",
        "m": "material",
        "ms": "measurement",
        "pa": "place",
        "pl": "plant",
        "pn": "personal name",
        "pro": "profession",
        "sn": "sensory",
        "tl": "tool",
        "md": "medical",
        "mu": "music"
    },
    loaded: false
}	