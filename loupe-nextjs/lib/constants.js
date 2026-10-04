export const ASSET_TYPES = [
  { key: "BOX", num: "01", label: "Box Shot", suffix: "Box" },
  { key: "FRONT", num: "02", label: "Front", suffix: "Front" },
  { key: "SIDE", num: "03", label: "Side", suffix: "Side" },
  { key: "ANGLE_45", num: "04", label: "45° Angle", suffix: "45-Degree" },
  { key: "TOP", num: "05", label: "Top View", suffix: "Top" },
  { key: "MACRO", num: "06", label: "Macro / Detail", suffix: "Macro" },
  {
    key: "MODEL_WEARING",
    num: "07",
    label: "Model Wearing",
    suffix: "Model-Wearing",
  },
  { key: "LIFESTYLE", num: "08", label: "Lifestyle", suffix: "Lifestyle" },
  { key: "SOCIAL", num: "09", label: "Social Media", suffix: "Social" },
  // Video generation disabled for now.
  // {
  //   key: "MODEL_VIDEO",
  //   num: "10",
  //   label: "Model Video",
  //   suffix: "Model-Video",
  // },
];

export const CATEGORIES = [
  "Necklace",
  "Ring",
  "Earrings",
  "Bracelet",
  "Pendant",
  "Anklet",
  "Brooch",
];

export const STYLES = [
  "Luxury",
  "Minimal",
  "Modern",
  "Bridal",
  "Indian",
  "Festive",
  "Editorial",
];

export const BACKGROUNDS = ["White", "Beige", "Black", "Grey", "Luxury"];

export const MODELS_OPT = ["Female", "Male", "No model"];

export const RATIOS = ["1:1", "4:5", "9:16", "16:9"];

export const BG_HEX_MAP = {
  White: "#F7F2E7",
  Beige: "#EFE3CB",
  Black: "#15120F",
  Grey: "#DCD6C9",
  Luxury: "#1E1A16",
};
