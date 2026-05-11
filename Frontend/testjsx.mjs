import HTMLtoJSX from 'htmltojsx'; const converter = new HTMLtoJSX({ createClass: false }); console.log(converter.convert('<div class=\"foo\" style=\"width: 10px;\">hello</div>'));
