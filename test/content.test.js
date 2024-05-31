/**
 * @jest-environment jsdom
 */

import { expect, describe, beforeEach, it } from "@jest/globals";
import { JSDOM } from "jsdom";
import { processNode } from "../content";

const { window } = new JSDOM();
global.document = window.document;


describe("processNode function", () => {

    it("應突出顯示 p 元素中的單字", () => {
        document.body.innerHTML = `
                <div id="test-container">
                    <p>This is a text paragraph.</p>
                    <p>This is another example paragraph.</p>
                </div>
            `;

        processNode(["text", "example"]);


        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(2);
    });

    it('應突出顯示標題元素中的單字', () => {
        document.body.innerHTML = `
            <div id="test-container">
                <h1>This is a heading</h1>
                <h2>This is another heading</h2>
            </div>
        `;

        processNode(["heading"]);

        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(2);
        expect(spanElements[0].textContent).toBe("heading");
        expect(spanElements[1].textContent).toBe("heading");
    });

    it('應突出顯示 li 元素中的單字', () => {
        document.body.innerHTML = `
            <div id="test-container">
                <ul>
                    <li>This is a list item.</li>
                    <li>This is another example item.</li>
                </ul>
            </div>
        `;

        processNode(["list", "example"]);

        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(2);
        expect(spanElements[0].textContent).toBe("list");
        expect(spanElements[1].textContent).toBe("example");
    });

    it('應突出顯示 table 中存在的單字', () => {
        document.body.innerHTML = `
            <table>
                <tr>
                    <td>This is a table cell.</td>
                    <td>Another example cell.</td>
                </tr>
            </table>
        `;

        processNode(["table", "cell"]);

        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(3);
        expect(spanElements[0].textContent).toBe("table");
        expect(spanElements[1].textContent).toBe("cell");
        expect(spanElements[2].textContent).toBe("cell");
    });

    it ("能匹配大寫字元並在文本中維持大寫", () => {
        document.body.innerHTML = `
            <div id="test-container">
                <h1>Display images on the web</h1>
            </div>
            `;

        processNode(["display"]);
        expect(document.querySelector("span")?.textContent).toContain("Display");
    });

    it ("在文字標籤外的 a 元素能正確套用", () => {
        document.body.innerHTML = `
            <div id="test-container">
                <a href="#">This is a link</a>
            </div>
            `;

        processNode(["link"]);
        expect(document.querySelector("span")?.textContent).toContain("link");
    })

    it ("在文字標籤內的 a 元素能正確套用", () => {
        document.body.innerHTML = `
            <div id="test-container">
                <p>This is a <a href="#">link</a></p>
            </div>
            `;

        processNode(["link"]);
        expect(document.querySelector("span")?.textContent).toContain("link");
    });

    it ("文字標籤內符合條件的字元有重複時，都必須套用", () => {
        document.body.innerHTML = `
            <div id="test-container">
                <p>The website is the best website.</p>
            </div>
            `;

        processNode(["website"]);
        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(2);
    });

    it ("文字標籤有包含其他子節點時仍套用", () => {
        document.body.innerHTML = `
            <div id="test-container">
                <h3>
                    coworker <i>同事 </i>
                </h3>
            </div>
            `;

        processNode(["Coworker"]);
        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(1);
    });

    it ("在文字標籤本身和 a 都有符合條件的字元時，都必須套用", () => {
        document.body.innerHTML = `
            <div id="test-container">
                <p>This is a <a href="#">website link</a></p>
            </div>
            `;

        processNode(["link", "this"]);
        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(2);
    });

    it ("文字標籤內符合條件的字元有重複時，且裡面的 a 元素有符合的字串時，都必須套用", () => {
        document.body.innerHTML = `
            <div id="test-container">
                <p>The website is the best website, It is the <a href="#">link</a>.</p>
            </div>
            `;
        processNode(["website", "link"]);
        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(3);
    });

    it('空的文字標籤不應導致錯誤', () => {
        document.body.innerHTML = `
            <div id="test-container">
                <p></p>
                <p>This is a text paragraph.</p>
            </div>
        `;

        processNode(["text"]);

        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(1);
        expect(spanElements[0].textContent).toBe("text");
    });

    it('應正確處理沒有符合單字的元素', () => {
        document.body.innerHTML = `
            <div id="test-container">
                <p>This is a text paragraph.</p>
                <p>This is another example paragraph.</p>
            </div>
        `;

        processNode(["nonexistent"]);

        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(0);
    });

    it('應正確處理帶有特殊字元的元素', () => {
        document.body.innerHTML = `
            <div id="test-container">
                <p>This is a text paragraph with special characters like !@#$%^&*.</p>
                <p>This is another example paragraph with special characters like (){}[]</p>
            </div>
        `;

        processNode(["text", "example"]);

        const spanElements = document.querySelectorAll("span");
        expect(spanElements.length).toBe(2);
        expect(spanElements[0].textContent).toBe("text");
        expect(spanElements[1].textContent).toBe("example");
    });
});
