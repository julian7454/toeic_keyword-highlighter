//chrome.storage.local.get(['tdContents']).then(result => {
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "executeContentScript") {
    const words = message.words;
    processNode(words);
  }
});

function processNode (words) {
  document
    .querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, td, a, span")
    .forEach((node) => {
      const childNodes = node.childNodes;
      let hasNonTextNode = false;

      // 檢查節點的子節點是否包含非文字節點
      for (let i = 0; i < childNodes.length; i++) {
        if (childNodes[i].nodeType !== Node.TEXT_NODE) {
          hasNonTextNode = true;
          break;
        }
      }

      // 如果節點沒有子節點或子節點全部為文字節點，則進行處理
      if (!hasNonTextNode) {
        const text = node.textContent;
        let modifiedText = text;
        let textModified = false; // 新增一個變數來標記文本是否有被修改過

        // 遍歷要查找的單詞列表
        words.forEach((word) => {
          const regex = new RegExp("\\b" + word + "\\b", "gi"); // 創建一個正則表達式，匹配獨立的單詞
          if (modifiedText.match(regex)) {
            // 檢查文本是否包含匹配到的單詞
            modifiedText = modifiedText.replace(regex, (match) => {
              // 使用函數進行替換，以保留原始文本的大小寫
              const replacement = `<span style="color: red;">${word}</span>`;
              // 檢查原始匹配的字符串是否包含大寫字母
              if (/[A-Z]/.test(match)) {
                // 如果包含大寫，則將替換文本中的單詞轉換為與原始匹配相同的大小寫
                return replacement.replace(word, match);
              }
              // 如果不包含大寫，則直接使用小寫替換文本
              return replacement;
            });

            textModified = true; // 如果文本有被修改過，設置為 true
          }
        });

        // 如果文本有被修改過，才執行以下操作
        if (textModified) {
          // 創建一個 DocumentFragment
          //const fragment = document.createDocumentFragment();

          // 將修改後的內容添加到 DocumentFragment 中
          const tempContainer = document.createElement(node.tagName);
          // 遍歷原始節點的屬性，並將它們複製到臨時容器中的相應標籤上
          for (let i = 0; i < node.attributes.length; i++) {
            const attribute = node.attributes[i];
            tempContainer.setAttribute(
              attribute.nodeName,
              attribute.nodeValue
            );
          }

          tempContainer.innerHTML = modifiedText;
          //while (tempContainer.firstChild) {
          //    fragment.appendChild(tempContainer.firstChild);
          //}
          // 將 DocumentFragment 中的內容替換原始文本內容
          node.parentNode.replaceChild(tempContainer, node);
        }
      }
    });
}

//export { processNode };
