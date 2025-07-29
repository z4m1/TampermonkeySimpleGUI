// ==UserScript==
// @name        GUI Factory Library
// @namespace   z4m1
// @description Tampermonkey GUI Factory Library for sharing
// @version     1.0.0
// @grant       GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // --- GUIManager クラス ---
    // GUIコンテナのドラッグと表示/非表示を管理
    class GUIManager {
        /**
         * @param {HTMLElement} containerElement
         * @param {object} options - { width: string, height: string }
         */
        constructor(containerElement, options = {}) {
            this.container = containerElement;
            this.header = document.createElement('div');
            this.content = document.createElement('div');
            this.toggleButton = document.createElement('span');

            // --- スタイル設定 ---
            // Header
            this.header.style.cursor = 'grab';
            this.header.style.backgroundColor = '#333';
            this.header.style.color = '#fff';
            this.header.style.padding = '5px 10px';
            this.header.style.display = 'flex';
            this.header.style.justifyContent = 'space-between';
            this.header.style.alignItems = 'center';
            this.header.textContent = 'GUIパネル';

            // Toggle Button
            this.toggleButton.textContent = '▼'; // 初期状態: 開いている
            this.toggleButton.style.cursor = 'pointer';
            this.toggleButton.style.marginLeft = '10px';
            this.header.appendChild(this.toggleButton);

            // Content
            this.content.style.padding = '10px';
            this.content.style.border = '1px solid #ccc';
            this.content.style.borderTop = 'none';
            this.content.style.background = '#f9f9f9';
            // コンテンツがコンテナの高さを超えた場合にスクロールバーを表示
            this.content.style.overflowY = 'auto';

            // Container
            this.container.style.position = 'fixed';
            this.container.style.top = '10px';
            this.container.style.right = '10px';
            this.container.style.zIndex = '9999';
            this.container.style.boxShadow = '2px 2px 8px rgba(0,0,0,0.2)';
            this.container.style.display = 'flex';
            this.container.style.flexDirection = 'column';

            // --- 問題点の修正 ---
            // 1. リサイズを無効化し、サイズ指定を可能に
            this.container.style.resize = 'none'; // 手動リサイズを無効化
            if (options.width) {
                this.container.style.width = options.width;
            } else {
                this.container.style.minWidth = '200px'; // 指定がない場合は最小幅を設定
            }
            if (options.height) {
                // 高さが指定された場合、content部分が残りの高さを占めるようにする
                this.container.style.height = options.height;
                this.content.style.flexGrow = '1';
                this.content.style.minHeight = '0'; // flexアイテムの縮小を許可
            }

            this.container.appendChild(this.header);
            this.container.appendChild(this.content);

            this.isDragging = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.isContentHidden = false;

            this.addDragListeners();
            this.addToggleListener();
        }

        addDragListeners() {
            this.header.addEventListener('mousedown', (e) => {
                // トグルボタン上でのドラッグは無効
                if (e.target === this.toggleButton) return;

                this.isDragging = true;
                this.header.style.cursor = 'grabbing';
                document.body.style.userSelect = 'none'; // ドラッグ中のテキスト選択を防止

                // 3. ドラッグ問題の修正: rightプロパティを無効化し、leftで位置を制御する
                if (this.container.style.right !== 'auto' && this.container.style.right !== '') {
                    const rect = this.container.getBoundingClientRect();
                    this.container.style.left = `${rect.left}px`;
                    this.container.style.right = 'auto';
                }

                this.offsetX = e.clientX - this.container.getBoundingClientRect().left;
                this.offsetY = e.clientY - this.container.getBoundingClientRect().top;
            });

            document.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                this.container.style.left = `${e.clientX - this.offsetX}px`;
                this.container.style.top = `${e.clientY - this.offsetY}px`;
            });

            document.addEventListener('mouseup', () => {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.header.style.cursor = 'grab';
                document.body.style.userSelect = '';
            });
        }

        addToggleListener() {
            this.toggleButton.addEventListener('click', () => {
                this.toggleContent();
            });
        }

        toggleContent() {
            this.isContentHidden = !this.isContentHidden;
            // 2. 非表示問題の修正: contentのdisplayを切り替える
            if (this.isContentHidden) {
                this.content.style.display = 'none';
                this.toggleButton.textContent = '▲'; // 閉じている状態
            } else {
                this.content.style.display = 'block';
                this.toggleButton.textContent = '▼'; // 開いている状態
            }
        }

        setContent(element) {
            this.content.innerHTML = '';
            this.content.appendChild(element);
        }

        setHeaderTitle(title) {
            const textNode = Array.from(this.header.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            if (textNode) {
                textNode.nodeValue = title;
            } else {
                this.header.insertBefore(document.createTextNode(title), this.toggleButton);
            }
        }
    }

    // --- GUIFactory クラス ---
    // GUI部品とコンテナを生成
    class GUIFactory {
        static createContainer(title = 'GUIパネル', options = {}) {
            const containerDiv = document.createElement('div');
            const manager = new GUIManager(containerDiv, options); // optionsを渡す
            manager.setHeaderTitle(title);
            document.body.appendChild(containerDiv);
            return { element: containerDiv, manager: manager };
        }

        static createText(text) {
            const span = document.createElement('span');
            span.textContent = text;
            span.style.whiteSpace = 'pre-wrap';
            return span;
        }

        static createTextArea(initialValue = '', resizable = true) {
            const textarea = document.createElement('textarea');
            textarea.value = initialValue;
            textarea.style.width = '100%';
            textarea.style.minHeight = '60px';
            textarea.style.boxSizing = 'border-box';
            if (!resizable) {
                textarea.style.resize = 'none';
            }
            return textarea;
        }

        static createButton(text, callback) {
            const button = document.createElement('button');
            button.textContent = text;
            button.style.padding = '8px 15px';
            button.style.margin = '5px';
            button.style.cursor = 'pointer';
            button.onclick = callback;
            return button;
        }

        static createLayout(layoutConfig, componentsMap = new Map()) {
            const fragment = document.createDocumentFragment();
            layoutConfig.forEach(rowConfig => {
                const rowDiv = document.createElement('div');
                rowDiv.style.display = 'flex';
                rowDiv.style.alignItems = 'center';
                rowDiv.style.marginBottom = '5px';

                rowConfig.forEach(item => {
                    let element;
                    const config = (typeof item === 'string') ? { type: 'text', value: item } : item;

                    switch (config.type) {
                        case 'text':
                            element = GUIFactory.createText(config.value);
                            break;
                        case 'textarea':
                            element = GUIFactory.createTextArea(config.value, config.resizable);
                            if (config.id) componentsMap.set(config.id, element);
                            break;
                        case 'button':
                            element = GUIFactory.createButton(config.text, config.callback || (() => {}));
                            if (config.id) componentsMap.set(config.id, element);
                            break;
                        default:
                            console.warn('不明な部品タイプ:', config.type);
                            return;
                    }
                    element.style.marginRight = '10px';
                    rowDiv.appendChild(element);
                });
                fragment.appendChild(rowDiv);
            });
            return fragment;
        }
    }

    window.GUIFactory = GUIFactory;
})();