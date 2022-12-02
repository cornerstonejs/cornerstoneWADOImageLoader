export default function getValue(tag, justElement = true) {
  if (tag) {
    if (tag.Value) {
      if (tag.Value[0] && justElement) {
        return tag.Value[0];
      }

      return tag.Value;
    }
  }

  return tag;
}
