![](https://badgen.net/badge/Editor.js/v2.0/blue)

# LinkWithTarget Tool

A tool link with target attribute [Editor.js](https://editorjs.io).  

![image](https://user-images.githubusercontent.com/44319098/118274578-f8c6b700-b4cd-11eb-808c-190b30721412.png)

## Installation

### Get the package via NPM

```shell
npm i editorjs-link-with-target
```
### or via Yarn

```shell
yarn add editorjs-link-with-target
```

Include module at your application

```javascript
import LinkWithTarget from 'editorjs-link-with-target'
```

## Usage
Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
var editor = EditorJS({
  ...
  
  tools: {
    ...

    link: {
      class: Hyperlink
    }

    ...
  },

  ...

  i18n: {
    tools: {
      messages: {
        tools: {
          link: {
            'Open in new window': 'Открыть ссылку в новом окне'
          }
        }
      }
    }
  }
  
  ...
});
```

## License
[MIT](https://tamit.info)
