const ShortenText = (text, limit = 20) => {
  if (typeof text !== "string") return ""; // safety check
  return text.length > limit ? text.slice(0, limit) + "..." : text;
};


export default ShortenText;