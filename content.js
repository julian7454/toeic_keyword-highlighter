chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "executeContentScript") {
        const words = message.words;
        processNode(words);
    }
});

function processAndReplaceTextNodes(currentNode, elementStack, words) {
    currentNode?.childNodes.forEach((childNode) => {
        if (
            childNode.nodeType === Node.TEXT_NODE &&
            !childNode?.parentElement?.classList.contains("highlighted-word")
        ) {
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
                const tempContainer = document.createElement("div");
                tempContainer.innerHTML = text;

                const fragment = document.createDocumentFragment();
                while (tempContainer.firstChild) {
                    fragment.appendChild(tempContainer.firstChild);
                }

                childNode.replaceWith(fragment);
            }
        } else if (childNode.nodeType === Node.ELEMENT_NODE) {
            for (let i = 0; i < currentNode.childNodes.length; i++) {
                elementStack.push(currentNode.childNodes[i]);
            }
        }
    });
}

function processNode(words) {
    const elementStack = Array.from(
        document.querySelectorAll(
            "p, h1, h2, h3, h4, h5, h6, li, td, a, span, q, dl, details, label, code"
        )
    );

    function processNextChunk() {
        const chunkSize = 100; // 每次處理的節點數量
        let count = 0;

        // console.time("processNode");

        while (elementStack.length && count < chunkSize) {
            const currentNode = elementStack.pop();
            count++;

            processAndReplaceTextNodes(currentNode, elementStack, words);
        }

        if (elementStack.length) {
            // console.log('stack length' + elementStack.length);
            // for testing
            // processNextChunk();
            requestAnimationFrame(processNextChunk);
        }

        // console.timeEnd("processNode");
    }
    // for testing
    // processNextChunk();
    requestAnimationFrame(processNextChunk);
}
// for testing
// export { processNode };
