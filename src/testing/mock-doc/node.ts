import { createCSSStyleDeclaration } from './css-style-declaration';
import { MockAttr, MockAttributeMap } from './attribute';
import { MockClassList } from './class-list';
import { MockEvent, addEventListener, dispatchEvent, removeEventListener } from './event';
import { NODE_TYPES } from './constants';
import { parseFragment } from './parse-html';
import { selectAll, selectOne } from './selector';
import { SerializeElementOptions, serialize } from './serialize-node';


export class MockNode {
  childNodes: MockNode[] = [];
  nodeName: string;
  nodeType: number;
  nodeValue: string;
  ownerDocument: any;
  parentNode: MockNode = null;

  constructor(ownerDocument: any) {
    this.ownerDocument = ownerDocument;
  }

  appendChild(newNode: MockNode) {
    newNode.remove();
    newNode.parentNode = this;
    this.childNodes.push(newNode);
    return newNode;
  }

  cloneNode(deep?: boolean): MockNode {
    throw new Error(`invalid node type to clone: ${this.nodeType}, deep: ${deep}`);
  }

  get firstChild() {
    return this.childNodes[0] || null;
  }

  insertBefore(newNode: MockNode, referenceNode: MockNode) {
    if (newNode.nodeType === NODE_TYPES.DOCUMENT_FRAGMENT_NODE) {
      for (let i = 0; i < newNode.childNodes.length; i++) {
        insertBefore(this, newNode.childNodes[i], referenceNode);
      }
    } else {
      insertBefore(this, newNode, referenceNode);
    }

    return newNode;
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }

  get nextSibling() {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this) + 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }

  get parentElement() {
    return ((this.parentNode as any) as MockElement) || null;
  }
  set parentElement(value: any) {
    this.parentNode = value;
  }

  get previousSibling() {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this) - 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }

  removeChild(childNode: MockNode) {
    const index = this.childNodes.indexOf(childNode);
    if (index > -1) {
      this.childNodes.splice(index, 1);
      childNode.parentNode = null;
    } else {
      throw new Error(`node not found within childNodes during removeChild`);
    }
    return childNode;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  replaceChild(newChild: MockNode, oldChild: MockNode) {
    if (oldChild.parentNode === this) {
      this.insertBefore(newChild, oldChild);
      oldChild.remove();
      return newChild;
    }
    return null;
  }

  get textContent() {
    return this.nodeValue;
  }
  set textContent(value: string) {
    this.nodeValue = String(value);
  }

  static ELEMENT_NODE = 1;
  static TEXT_NODE = 3;
  static PROCESSING_INSTRUCTION_NODE = 7;
  static COMMENT_NODE = 8;
  static DOCUMENT_NODE = 9;
  static DOCUMENT_TYPE_NODE = 10;
  static DOCUMENT_FRAGMENT_NODE = 11;
}


export class MockElement extends MockNode {
  namespaceURI: string;

  constructor(ownerDocument: any, nodeName: string) {
    super(ownerDocument);
    this.nodeType = NODE_TYPES.ELEMENT_NODE;
    if (nodeName) {
      this.nodeName = nodeName.toUpperCase();
    }
  }

  addEventListener(type: string, handler: (ev?: any) => void) {
    addEventListener(this, type, handler);
  }

  private _attributes: MockAttributeMap;
  get attributes() {
    if (!this._attributes) {
      this._attributes = new MockAttributeMap();
    }
    return this._attributes;
  }
  set attributes(attrs: MockAttributeMap) {
    this._attributes = attrs;
  }

  get children() {
    return this.childNodes.filter(n => n.nodeType === NODE_TYPES.ELEMENT_NODE) as MockElement[];
  }

  get className() { return this.getAttribute('class') || ''; }
  set className(value: string) { this.setAttribute('class', value); }

  get classList() {
    return new MockClassList(this as any);
  }

  click() {
    dispatchEvent(this, new MockEvent('click'));
  }

  cloneNode(deep?: boolean) {
    const cloned = new MockElement(null, this.nodeName);
    cloned.attributes = this.attributes.cloneAttributes();

    if (deep) {
      for (let i = 0; i < this.childNodes.length; i++) {
        const clonedChildNode = this.childNodes[i].cloneNode(true);
        cloned.appendChild(clonedChildNode);
      }
    }

    return cloned;
  }

  closest() {
    throw new Error(`closest() ${NOT_IMPL}`);
  }

  get dir() { return this.getAttribute('dir') || ''; }
  set dir(value: string) { this.setAttribute('dir', value); }

  dispatchEvent(ev: MockEvent) {
    return dispatchEvent(this, ev);
  }

  get firstElementChild() {
    return this.children[0] || null;
  }

  getAttribute(name: string) {
    return this.getAttributeNS(null, name);
  }

  getAttributeNS(namespaceURI: string, name: string) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, name);
    if (attr) {
      return attr.value;
    }
    return null;
  }

  get id() { return this.getAttribute('id') || ''; }
  set id(value: string) { this.setAttribute('id', value); }

  get innerHTML() {
    if (this.childNodes.length === 0) {
      return '';
    }
    return serialize(this, {
      excludeRoot: true,
      newLines: false,
      indentSpaces: 0
    });
  }

  set innerHTML(html: string) {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      this.removeChild(this.childNodes[i]);
    }

    if (html) {
      const frag = parseFragment(this.ownerDocument, html);
      for (let i = 0; i < frag.childNodes.length; i++) {
        this.appendChild(frag.childNodes[i]);
      }
    }
  }

  get innerText() {
    const text: string[] = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }

  set innerText(value: string) {
    setTextContent(this, value);
  }

  hasAttribute(name: string) {
    return this.getAttribute(name) !== null;
  }

  hasAttributeNS(namespaceURI: string, name: string) {
    return this.getAttributeNS(namespaceURI, name) !== null;
  }

  get hidden() { return this.hasAttribute('hidden'); }
  set hidden(isHidden: boolean) {
    if (isHidden) {
      this.setAttribute('hidden', '');
    } else {
      this.removeAttribute('hidden');
    }
  }

  get lang() { return this.getAttribute('lang') || ''; }
  set lang(value: string) { this.setAttribute('lang', value); }

  get lastElementChild() {
    const children = this.children;
    return children[children.length - 1] || null;
  }

  matches() {
    throw new Error(`matches() ${NOT_IMPL}`);
  }

  get nextElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement && (parentElement.nodeType === NODE_TYPES.ELEMENT_NODE || parentElement.nodeType === NODE_TYPES.DOCUMENT_FRAGMENT_NODE || parentElement.nodeType === NODE_TYPES.DOCUMENT_NODE)) {
      const children = parentElement.children;
      const index = children.indexOf(this) + 1;
      return parentElement.children[index] || null;
    }
    return null;
  }

  get outerHTML() {
    return serialize(this, {
      excludeRoot: false,
      newLines: false,
      indentSpaces: 0
    });
  }

  get previousElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement && (parentElement.nodeType === NODE_TYPES.ELEMENT_NODE || parentElement.nodeType === NODE_TYPES.DOCUMENT_FRAGMENT_NODE || parentElement.nodeType === NODE_TYPES.DOCUMENT_NODE)) {
      const children = parentElement.children;
      const index = children.indexOf(this) - 1;
      return parentElement.children[index] || null;
    }
    return null;
  }

  querySelector(selector: string) {
    return selectOne(selector, this);
  }

  querySelectorAll(selector: string) {
    return selectAll(selector, this);
  }

  removeAttribute(name: string) {
    this.removeAttributeNS(null, name);
  }

  removeAttributeNS(namespaceURI: string, name: string) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, name);
    if (attr) {
      this.attributes.removeNamedItemNS(attr);
    }
  }

  removeEventListener(type: string, handler: any) {
    removeEventListener(this, type, handler);
  }

  setAttribute(name: string, value: any) {
    this.setAttributeNS(null, name, value);
  }

  setAttributeNS(namespaceURI: string, name: string, value: any) {
    const attributes = this.attributes;
    let attr = attributes.getNamedItemNS(namespaceURI, name);
    if (attr) {
      attr.value = String(value);

    } else {
      attr = new MockAttr();
      attr.namespaceURI = namespaceURI;
      attr.name = name;
      attr.value = String(value);
      attributes.items.push(attr);
    }
  }

  private _style: any;
  get style() {
    if (!this._style) {
      this._style = createCSSStyleDeclaration();
    }
    return this._style;
  }
  set style(style: any) {
    this._style = style;
  }

  get title() { return this.getAttribute('title') || ''; }
  set title(value: string) { this.setAttribute('title', value); }

  get tabIndex() { return parseInt(this.getAttribute('tabindex') || '-1', 10); }
  set tabIndex(value: number) { this.setAttribute('tabindex', value); }

  get tagName() {
    return this.nodeName;
  }

  set tagName(value: string) {
    this.nodeName = value.toUpperCase();
  }

  get textContent() {
    const text: string[] = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }

  set textContent(value: string) {
    setTextContent(this, value);
  }

  onabort() {/**/}
  onauxclick() {/**/}
  onbeforecopy() {/**/}
  onbeforecut() {/**/}
  onbeforepaste() {/**/}
  onblur() {/**/}
  oncancel() {/**/}
  oncanplay() {/**/}
  oncanplaythrough() {/**/}
  onchange() {/**/}
  onclick() {/**/}
  onclose() {/**/}
  oncontextmenu() {/**/}
  oncopy() {/**/}
  oncuechange() {/**/}
  oncut() {/**/}
  ondblclick() {/**/}
  ondrag() {/**/}
  ondragend() {/**/}
  ondragenter() {/**/}
  ondragleave() {/**/}
  ondragover() {/**/}
  ondragstart() {/**/}
  ondrop() {/**/}
  ondurationchange() {/**/}
  onemptied() {/**/}
  onended() {/**/}
  onerror() {/**/}
  onfocus() {/**/}
  onformdata() {/**/}
  onfullscreenchange() {/**/}
  onfullscreenerror() {/**/}
  ongotpointercapture() {/**/}
  oninput() {/**/}
  oninvalid() {/**/}
  onkeydown() {/**/}
  onkeypress() {/**/}
  onkeyup() {/**/}
  onload() {/**/}
  onloadeddata() {/**/}
  onloadedmetadata() {/**/}
  onloadstart() {/**/}
  onlostpointercapture() {/**/}
  onmousedown() {/**/}
  onmouseenter() {/**/}
  onmouseleave() {/**/}
  onmousemove() {/**/}
  onmouseout() {/**/}
  onmouseover() {/**/}
  onmouseup() {/**/}
  onmousewheel() {/**/}
  onpaste() {/**/}
  onpause() {/**/}
  onplay() {/**/}
  onplaying() {/**/}
  onpointercancel() {/**/}
  onpointerdown() {/**/}
  onpointerenter() {/**/}
  onpointerleave() {/**/}
  onpointermove() {/**/}
  onpointerout() {/**/}
  onpointerover() {/**/}
  onpointerup() {/**/}
  onprogress() {/**/}
  onratechange() {/**/}
  onreset() {/**/}
  onresize() {/**/}
  onscroll() {/**/}
  onsearch() {/**/}
  onseeked() {/**/}
  onseeking() {/**/}
  onselect() {/**/}
  onselectstart() {/**/}
  onstalled() {/**/}
  onsubmit() {/**/}
  onsuspend() {/**/}
  ontimeupdate() {/**/}
  ontoggle() {/**/}
  onvolumechange() {/**/}
  onwaiting() {/**/}
  onwebkitfullscreenchange() {/**/}
  onwebkitfullscreenerror() {/**/}
  onwheel() {/**/}

  toString(opts?: SerializeElementOptions) {
    return serialize(this, opts);
  }

}

function insertBefore(parentNode: MockNode, newNode: MockNode, referenceNode: MockNode) {
  newNode.remove();
  newNode.parentNode = parentNode;

  if (referenceNode) {
    const index = parentNode.childNodes.indexOf(referenceNode);
    if (index > -1) {
      parentNode.childNodes.splice(index, 0, newNode);
    } else {
      throw new Error(`referenceNode not found in parentNode.childNodes`);
    }

  } else {
    parentNode.childNodes.push(newNode);
  }

  return newNode;
}

const NOT_IMPL = `is not implemented for MockElement. For unit tests, instead try document.getElementById(), document.getElementsByTagName(), or document.getElementsByClassName()`;

function getTextContent(childNodes: MockNode[], text: string[]) {
  for (let i = 0; i < childNodes.length; i++) {
    const childNode = childNodes[i];
    if (childNode.nodeType === NODE_TYPES.TEXT_NODE) {
      text.push(childNode.nodeValue);
    } else if (childNode.nodeType === NODE_TYPES.ELEMENT_NODE) {
      getTextContent(childNode.childNodes, text);
    }
  }
}


function setTextContent(elm: MockElement, text: string) {
  for (let i = elm.childNodes.length - 1; i >= 0; i--) {
    elm.removeChild(elm.childNodes[i]);
  }
  const textNode = new MockNode(elm.ownerDocument);
  textNode.nodeType = NODE_TYPES.TEXT_NODE;
  textNode.nodeValue = text;
  elm.appendChild(textNode);
}
