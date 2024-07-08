/**
 * @param text: "_"로 구분 지어진 단어 모음.
 */
export const splitTextIntoChunks = (
  text: string,
  chunkSize: number,
  splitBy = "_",
) => {
  const chunks = [];
  const words = text.split(splitBy);
  let currentChunk = "";

  for (let word of words) {
    if ((currentChunk + word).length <= chunkSize) {
      currentChunk += (currentChunk ? splitBy : "") + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};
