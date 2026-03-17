const ShortenText = (text, limit = 40) => {
  if (typeof text !== "string") return ""; // safety check
  return text.length > limit ? text.slice(0, limit) + "..." : text;
};


export default ShortenText;