# TampermonkeySimpleGUI
できるだけ簡素でメンテナンスしやすい自分用の簡易GUIライブラリ。

# 要素
### GUIコンテナ
- 名前と固定サイズを指定
- 表示/非表示機能
- ドラッグで移動
### テキスト: `{ type:'text', value:'テキスト' }`
- 文字列を指定
### テキストエリア `{ type:'textarea', id:'myTextArea', value:'デフォルト値', resizable:true }`
- デフォルト文字列、id、リサイズの有無を指定
### ボタン:  `{ type:'button', id:'copyButton', text:'コピー' }`
- テキスト、idを指定
# レイアウト指定方法
二次元のリストでレイアウトを指定。
[
    [{テキスト},{テキストエリア}],
    [{ボタン}]
]

# 使用例
```
// @require このファイル

(function() {
    'use strict';

    window.addEventListener('load', () => {
        // コンテナを作成 (幅450px、高さ300pxに固定)
        const { manager: guiManager } = window.GUIFactory.createContainer(
            'Simple GUI',
            { width: '450px', height: '300px' }
        );

        const components = new Map();
        const layout = [
            [{ type: 'text', value: '入力してください:' }, { type: 'textarea', id: 'myTextArea', value: 'デフォルト値', resizable: true }],
            [{ type: 'button', id: 'myButton', text: 'テキストエリアの内容をログに出力' }],
            ['これは単なるテキストです。'],
            [{ type: 'textarea', id: 'anotherTextArea', value: 'リサイズ不可', resizable: false }],
            [{ type: 'button', id: 'copyButton', text: '上のテキストをコピー' }]
        ];

        const contentFragment = window.GUIFactory.createLayout(layout, components);
        guiManager.setContent(contentFragment);

        const myTextArea = components.get('myTextArea');
        const myButton = components.get('myButton');
        if (myButton && myTextArea) {
            myButton.onclick = () => {
                alert(`テキストエリアの内容: ${myTextArea.value}`);
                console.log('テキストエリアの内容:', myTextArea.value);
            };
        }

        const anotherTextArea = components.get('anotherTextArea');
        const copyButton = components.get('copyButton');
        if (copyButton && myTextArea && anotherTextArea) {
            copyButton.onclick = () => {
                anotherTextArea.value = myTextArea.value;
                alert('テキストがコピーされました！');
            };
        }
    });
})();
```