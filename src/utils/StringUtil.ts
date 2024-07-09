/**
 * @param text: "_"로 구분 지어진 단어 모음.
 */
export const splitTextIntoChunks = (
  text: string,
  chunkSize: number | number[],
  splitBy = "_",
) => {
  const chunks = [];
  const words = text.split(splitBy);
  let currentChunk = "";
  let chunkSizeIdx = 0;

  for (let word of words) {
    if (
      (currentChunk + word).length <=
      (typeof chunkSize === "number" ? chunkSize : chunkSize[chunkSizeIdx])
    ) {
      currentChunk += (currentChunk ? splitBy : "") + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
      chunkSizeIdx++;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};
