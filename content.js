//chrome.storage.local.get(['tdContents']).then(result => {
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "executeContentScript") {
    const words = message.words;
    processNode(words);
  }
});

function processNode(words) {
  const stack = Array.from(document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, td, a, span"));

  while (stack.length > 0) {
    const currentNode = stack.pop();

    currentNode?.childNodes.forEach((childNode) => {
      if (childNode.nodeType === Node.TEXT_NODE && !childNode?.parentElement?.classList.contains("highlighted-word")) {
        let text = childNode.textContent;
        let textModified = false;

        words.forEach((word) => {
          const regex = new RegExp("\\b" + word + "\\b", "gi");
          if (text?.match(regex)) {
            text = text.replace(regex, (match) => {
              const replacement = `<span class="highlighted-word" style="color: red;">${word}</span>`;
              return replacement.replace(word, match);
            });
            textModified = true;
          }
        });

        if (textModified) {
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = text;

          const fragment = document.createDocumentFragment();
          while (tempContainer.firstChild) {
            fragment.appendChild(tempContainer.firstChild);
          }

          childNode.replaceWith(fragment);
        }
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        stack.push(childNode);
      }
    });
  }
}

//export { processNode };
