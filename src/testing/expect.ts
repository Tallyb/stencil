import * as d from '../declarations';
import { parseFragment } from './parse-html';
import { serialize } from './mock-doc/serialize-node';
import deepEqual from 'fast-deep-equal';


export function toEqualHtml(input: string | HTMLElement, shouldEqual: string) {
  if (input == null) {
    throw new Error(`expect toEqualHtml value is null`);
  }

  let serializeA: string;

  if ((input as HTMLElement).nodeName) {
    serializeA = (input as HTMLElement).innerHTML;

  } else {
    const parseA = parseFragment(input as string);

    serializeA = serialize(parseA, {
      format: 'html'
    });
  }

  const parseB = parseFragment(shouldEqual);

  const serializeB = serialize(parseB, {
    format: 'html'
  });

  if (serializeA !== serializeB) {
    expect(serializeA).toBe(serializeB);
    return {
      message: () => 'HTML does not match',
      pass: false,
    };
  }

  return {
    message: () => 'expect HTML to match',
    pass: true,
  };
}

export function toEqualText(elm: HTMLElement, expectTextContent: string) {
  if (!elm) {
    throw new Error(`expect toEqualText value is null`);
  }

  if (typeof (elm as any).then === 'function') {
    throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
  }

  if (elm.nodeType !== 1) {
    throw new Error(`expect toEqualText value is not an element`);
  }

  const elmTextContent = (elm.textContent || '').trim();
  expectTextContent = (expectTextContent || '').trim();

  const pass = (elmTextContent === expectTextContent);

  return {
    message: () => `expected textContent "${expectTextContent}" to ${pass ? 'not ' : ''}equal "${elmTextContent}"`,
    pass: pass,
  };
}

export function toHaveAttribute(elm: HTMLElement, expectAttrName: string) {
  if (!elm) {
    throw new Error(`expect toHaveAttribute value is null`);
  }

  if (typeof (elm as any).then === 'function') {
    throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
  }

  if (elm.nodeType !== 1) {
    throw new Error(`expect toHaveAttribute value is not an element`);
  }

  const pass = elm.hasAttribute(expectAttrName);

  return {
    message: () => `expected to ${pass ? 'not ' : ''}have the attribute "${expectAttrName}"`,
    pass: pass,
  };
}

export function toEqualAttribute(elm: HTMLElement, expectAttrName: string, expectAttrValue: string) {
  if (!elm) {
    throw new Error(`expect toMatchAttribute value is null`);
  }

  if (typeof (elm as any).then === 'function') {
    throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
  }

  if (elm.nodeType !== 1) {
    throw new Error(`expect toMatchAttribute value is not an element`);
  }

  const receivedAttrValue = elm.getAttribute(expectAttrName);

  const pass = (expectAttrValue === receivedAttrValue);

  return {
    message: () => `expected attribute ${expectAttrName} "${expectAttrValue}" to ${pass ? 'not ' : ''}equal "${receivedAttrValue}"`,
    pass: pass,
  };
}

export function toEqualAttributes(elm: HTMLElement, expectAttrs: {[attrName: string]: any}) {
  if (!elm) {
    throw new Error(`expect toEqualAttributes value is null`);
  }

  if (typeof (elm as any).then === 'function') {
    throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
  }

  if (elm.nodeType !== 1) {
    throw new Error(`expect toEqualAttributes value is not an element`);
  }

  const attrNames = Object.keys(expectAttrs);

  const pass = attrNames.every(attrName => {
    let expectAttrValue = expectAttrs[attrName];
    if (expectAttrValue != null) {
      expectAttrValue = String(expectAttrValue);
    }
    return elm.getAttribute(attrName) === expectAttrValue;
  });

  return {
    message: () => `expected attributes to ${pass ? 'not ' : ''}equal ${attrNames.map(a => `[${a}="${expectAttrs[a]}"]`).join(', ')}`,
    pass: pass,
  };
}

export function toHaveReceivedEvent(eventSpy: d.EventSpy) {
  if (!eventSpy) {
    throw new Error(`toHaveReceivedEvent event spy is null`);
  }

  if (typeof (eventSpy as any).then === 'function') {
    throw new Error(`event spy must be a resolved value, not a promise, before it can be tested`);
  }

  if (!eventSpy.eventName) {
    throw new Error(`toHaveReceivedEvent did not receive an event spy`);
  }

  const pass = (eventSpy.events.length > 0);

  return {
    message: () => `expected to have ${pass ? 'not ' : ''}called "${eventSpy.eventName}" event`,
    pass: pass,
  };
}

export function toHaveReceivedEventTimes(eventSpy: d.EventSpy, count: number) {
  if (!eventSpy) {
    throw new Error(`toHaveReceivedEventTimes event spy is null`);
  }

  if (typeof (eventSpy as any).then === 'function') {
    throw new Error(`event spy must be a resolved value, not a promise, before it can be tested`);
  }

  if (!eventSpy.eventName) {
    throw new Error(`toHaveReceivedEventTimes did not receive an event spy`);
  }

  const pass = (eventSpy.length === count);

  return {
    message: () => `expected event "${eventSpy.eventName}" to have been called ${count} times, but was called ${eventSpy.events.length} time${eventSpy.events.length > 1 ? 's' : ''}`,
    pass: pass,
  };
}

export function toHaveReceivedEventDetail(eventSpy: d.EventSpy, eventDetail: any) {
  if (!eventSpy) {
    throw new Error(`toHaveReceivedEventDetail event spy is null`);
  }

  if (typeof (eventSpy as any).then === 'function') {
    throw new Error(`event spy must be a resolved value, not a promise, before it can be tested`);
  }

  if (!eventSpy.eventName) {
    throw new Error(`toHaveReceivedEventDetail did not receive an event spy`);
  }

  if (!eventSpy.lastEvent) {
    throw new Error(`event "${eventSpy.eventName}" was not received`);
  }

  const pass = deepEqual(eventSpy.lastEvent.detail, eventDetail);

  expect(eventSpy.lastEvent.detail).toEqual(eventDetail);

  return {
    message: () => `expected event "${eventSpy.eventName}" detail to ${pass ? 'not ' : ''}equal`,
    pass: pass,
  };
}

export function toHaveClass(elm: HTMLElement, expectClassName: string) {
  if (!elm) {
    throw new Error(`expect toHaveClass value is null`);
  }

  if (typeof (elm as any).then === 'function') {
    throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
  }

  if (elm.nodeType !== 1) {
    throw new Error(`expect toHaveClass value is not an element`);
  }

  const pass = elm.classList.contains(expectClassName);

  return {
    message: () => `expected to ${pass ? 'not ' : ''}have css class "${expectClassName}"`,
    pass: pass,
  };
}

export function toHaveClasses(elm: HTMLElement, expectClassNames: string[]) {
  if (!elm) {
    throw new Error(`expect toHaveClasses value is null`);
  }

  if (typeof (elm as any).then === 'function') {
    throw new Error(`element must be a resolved value, not a promise, before it can be tested`);
  }

  if (elm.nodeType !== 1) {
    throw new Error(`expect toHaveClasses value is not an element`);
  }

  const pass = expectClassNames.every(expectClassName => {
    return elm.classList.contains(expectClassName);
  });

  return {
    message: () => `expected to ${pass ? 'not ' : ''}have css classes "${expectClassNames.join(' ')}", but className is "${elm.className}"`,
    pass: pass,
  };
}

export function toMatchClasses(elm: HTMLElement, expectClassNames: string[]) {
  let { pass } = toHaveClasses(elm, expectClassNames);
  if (pass) {
    pass = expectClassNames.length === elm.classList.length;
  }

  return {
    message: () => `expected to ${pass ? 'not ' : ''}match css classes "${expectClassNames.join(' ')}", but className is "${elm.className}"`,
    pass: pass,
  };
}
