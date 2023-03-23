(() => {
  type TagFunction<R> = (strings: string[], ...args: unknown[]) => R
  type QueryFunction = (...args: any[]) => QuickElementArray<any>;
  type QuickElement<E extends Element> = ((...arg: any[]) => QuickElement<E>) & { e: E; query: QueryFunction; }
  type QuickElementArray<E extends Element> =
    ((...arg: any[]) => QuickElementArray<E>)
    & { a: QuickElement<E>[]; query: QueryFunction; }
  type QuickAction<E extends Element> = (e: E) => void;
  type QueryObject = { typedItemQueue: { type: 'observer' | 'action'; item: any; }[]; result?: QuickElementArray<any>; }
  const version = '1.3.0'
  const returnVersion = () => version;
  const nullFunction = () => void (0);
  const tagArgsToString: TagFunction<string> = (strings: string[], ...args: unknown[]): string => {
    const stringList = [];
    const sl = strings.length;
    const al = args.length;
    let si = 0;
    let ai = 0;
    while (sl - si > 0 || al - ai > 0) {
      sl - si > 0 && stringList.push(strings[si++]);
      al - ai > 0 && stringList.push(args[ai++]);
    }
    return stringList.join('');
  };
  const isTagFunctionArgs = (args: any[]): boolean => {
    return args.length > 0 && Array.isArray(args[0]) && args[0].every(v => typeof v === 'string');
  };
  const isQuickElement = (e: any): e is QuickElement<any> => typeof e === 'function' && typeof e.e === 'object';
  const isQuickElementArray = (a: any): a is QuickElementArray<any> => typeof a === 'function' && Array.isArray(a.a);
  const isPrimitiveQuickAction = (qa: any): qa is QuickAction<any> => typeof qa === 'function' && qa.__QE_QA__ === qa;
  const isProxiedQuickAction = (qa: any): qa is QuickAction<any> => typeof qa === 'function' && qa.__QE_QA_PROXY__ === qa;
  const isQuickAction = (qa: any): qa is QuickAction<any> => isProxiedQuickAction(qa) ? qa['__QE_QA_PROXY_IS_QUICK_ACTION__'] === true : isPrimitiveQuickAction(qa);
  const editElement = <E extends Element>(target: E, ...e: any[]) => {
    const el = e.length;
    let string = '';
    for (let i = 0; i < el; i++) {
      let elem: any = e[i];
      switch (typeof elem) {
        case 'string':
          string = string.concat(elem);
          break;
        case 'bigint':
        case 'number':
        case 'boolean':
          string = string.concat(String(elem));
          break;
        case 'function':
          if (isQuickElement(elem)) {
            if (string !== '') {
              target.appendChild(document.createTextNode(string));
              string = '';
            }
            target.appendChild(elem.e);
            continue;
          }
          if (isQuickElementArray(elem)) {
            editElement(target, ...elem.a);
            continue;
          }
          elem(target);
          break;
        case 'object':
          if (elem === null) {
            continue;
          }
          if (string !== '') {
            target.appendChild(document.createTextNode(string));
            string = '';
          }
          if (Array.isArray(elem)) {
            editElement(target, ...elem);
            continue;
          }
          target.appendChild(elem);
          break;
      }
    }
    if (string !== '') {
      target.appendChild(document.createTextNode(string));
    }
  };
  const applyToElement = <E extends Element>(target: E, ...args: any[]) => {
    if (isTagFunctionArgs(args)) {
      return editElement(target, tagArgsToString(args[0], ...args.slice(1)));
    }
    return editElement(target, ...args);
  };
  const nodeListToArray = <N extends Node>(nodeList: NodeListOf<N>): N[] => {
    const result = [];
    nodeList.forEach(n => result.push(n));
    return result;
  };
  const parseHTML = (html: string): ChildNode[] => {
    const tmpl = document.createElement('template');
    tmpl.innerHTML = html;
    return nodeListToArray(tmpl.content.childNodes);
  };
  const nodesFromHTML = (...args: any[]) => {
    if (isTagFunctionArgs(args)) {
      return parseHTML(tagArgsToString(args[0], ...args.slice(1)));
    }
    return parseHTML(args.join(''));
  };
  const nodesFromQuery = (target: Document | Element, ...args: any[]): Element[] => {
    if (isTagFunctionArgs(args)) {
      return nodeListToArray(target.querySelectorAll(tagArgsToString(args[0], ...args.slice(1))));
    }
    return nodeListToArray(target.querySelectorAll(args.join('')));
  }
  const fromElement = <E extends Element>(e: E): QuickElement<E> => {
    let qe: QuickElement<E>;
    qe = ((...args: any[]): QuickElement<E> => {
      applyToElement(qe.e, ...args);
      return qe;
    }) as QuickElement<E>;
    qe.e = e;
    qe.query = queryElement(qe);
    return qe;
  };
  const fromQuickElements = <E extends Element>(a: QuickElement<E>[]): QuickElementArray<E> => {
    let qea: QuickElementArray<E>;
    qea = ((...args: any[]): QuickElementArray<E> => {
      qea.a.forEach(e => applyToElement(e.e, ...args));
      return qea;
    }) as QuickElementArray<E>;
    qea.a = a;
    qea.query = queryElements(qea);
    return qea;
  }
  const fromHTML = (...args: any[]): QuickElementArray<any> => fromQuickElements(nodesFromHTML(...args).map(node => fromElement<any>(node)));
  const fromQuery = (target: Document | Element, ...args: any[]): QuickElementArray<any> => fromQuickElements(nodesFromQuery(target, ...args).map(node => fromElement<any>(node)));
  const fromArray = (a: any[]): QuickElementArray<any> => {
    const quickElements: QuickElement<any>[] = [];
    for (let elem of a) {
      switch (typeof elem) {
        case 'object':
          if (Array.isArray(elem)) {
            quickElements.push(...fromArray(elem).a);
            continue;
          }
          quickElements.push(fromElement(elem));
          continue;
        case 'function':
          if (isQuickElement(elem)) {
            quickElements.push(elem);
            continue;
          }
          if (isQuickElementArray(elem)) {
            quickElements.push(...elem.a);
            continue;
          }
          continue
        case 'string':
          quickElements.push(createElement(elem as any));
          continue;
        default:
          break;
      }
    }
    return fromQuickElements(quickElements);
  }
  const fromCode = (code: (a: (...e: any[]) => void) => void): any[] => {
    const accumulated = [];
    let consume: (...e: any[]) => void = (...e: any[]) => accumulated.push(...e);
    code((...e: any[]) => consume(...e));
    accumulated.push(element => consume = (...e: any[]) => fromElement(element)(e));
    return accumulated;
  }
  const createElement = <K extends keyof HTMLElementTagNameMap>(tagName: K): QuickElement<HTMLElementTagNameMap[K]> => fromElement(document.createElement(tagName));
  const processClassNames = (...classNames: string[]): string[] => {
    const result = [];
    classNames.forEach(n => result.push(...n.split(' ').filter(n => !!n)));
    return result;
  };
  // @ts-ignore
  const quickElement = new Proxy(nullFunction, {
    apply(target: any, thisArg: any, argArray: any[]): any {
      if (isTagFunctionArgs(argArray)) {
        return createElement(tagArgsToString(argArray[0], ...argArray.slice(1)) as any);
      }
      if (argArray.length === 1) {
        switch (typeof argArray[0]) {
          case 'object':
            if (Array.isArray(argArray[0])) {
              return fromArray(argArray[0]);
            }
            return fromElement(argArray[0]);
          case 'function':
            if (isQuickElement(argArray[0]) || isQuickElementArray(argArray[0])) {
              return argArray[0];
            }
            break;
          case 'string':
            return createElement(argArray[0] as any);
        }
      }
      if (argArray.length > 1) {
        return fromArray(argArray);
      }
      return null;
    },
    get(target: any, p: string | symbol, receiver: any): any {
      switch (p) {
        case 'apply':
          return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
        case 'bind':
          return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
        case 'call':
          return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
        case 'toString':
          return () => 'quickElement';
        // @ts-ignore
        case Symbol.toPrimitive:
          return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
        case '__PROPERTIES__':
          return qeProperties;
        default:
          const qeProp = qeProperties[p];
          if (typeof qeProp === 'function') {
            // @ts-ignore
            return new Proxy(nullFunction, {
              apply(target: any, thisArg: any, argArray: any[]): any {
                if (isTagFunctionArgs(argArray)) {
                  return qeProp(tagArgsToString(argArray[0], ...argArray.slice(1)));
                }
                return qeProp(...argArray);
              },
              get(target: any, p: string | symbol, receiver: any): any {
                switch (p) {
                  case 'apply':
                    return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
                  case 'bind':
                    return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
                  case 'call':
                    return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
                  case 'toString':
                    return () => this.toString();
                  // @ts-ignore
                  case Symbol.toPrimitive:
                    return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
                  default:
                    return qeProp[p];
                }
              },
              set(target: any, p: string | symbol, value: any): boolean {
                qeProp[p] = value;
                return true;
              }
            });
          }
          if (typeof p === 'string') {
            // @ts-ignore
            return new Proxy(nullFunction, {
              apply(target: any, thisArg: any, argArray: any[]): any {
                if (isTagFunctionArgs(argArray)) {
                  return elementSetAttribute(p, tagArgsToString(argArray[0], ...argArray.slice(1)));
                }
                if (argArray.length === 1) {
                  const arg = argArray[0]
                  switch (typeof arg) {
                    case 'object':
                      elementSetAttribute(p, '')(arg);
                      break;
                    case 'function':
                      return elementGetAttribute(p, arg);
                    default:
                      return elementSetAttribute(p, String(arg));
                  }
                }
                return () => {
                };
              },
              get(target: () => any, p: string | symbol, receiver: any): any {
                switch (p) {
                  case 'apply':
                    return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
                  case 'bind':
                    return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
                  case 'call':
                    return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
                  case 'toString':
                    return () => this.toString();
                  // @ts-ignore
                  case Symbol.toPrimitive:
                    return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
                }
              }
            });
          }
          return (): () => void => () => {
          };
      }
    },
  });
  const queryDocument = (...args: any[]): QuickElementArray<any> => fromQuery(document, ...args);
  const queryElement = <E extends Element>(target: QuickElement<E>): (...args: any[]) => QuickElementArray<any> => (...args: any[]) => fromQuery(target.e, ...args);
  if (!(Array.prototype as any).flat) {
    (Array.prototype as any).flat = function (depth: number) {
      if (typeof depth === 'undefined') {
        depth = 1;
      }
      const flatten = (array, depth) => {
        if (depth < 1) {
          return array.slice();
        }
        return array.reduce((accumulator, currentValue) => {
          return accumulator.concat(Array.isArray(currentValue) ? flatten(currentValue, depth - 1) : currentValue);
        }, []);
      };
      return flatten(this, depth);
    };
  }
  const queryElements = <E extends Element>(targets: QuickElementArray<E>): (...args: any[]) => QuickElementArray<any> => (...args: any[]) => fromQuickElements((targets.a.map(e => fromQuery(e.e, ...args).a) as any).flat(1));
  const objectAssignProperty = <T>(o: T, p: PropertyKey, value: any) => {
    if (typeof window.Object?.defineProperty === 'function') {
      Object.defineProperty(o, p, {value: value});
    } else {
      o[p] = value;
    }
  }
  const setAliasFunction = (...args: any[]): void => {
    if (isTagFunctionArgs(args)) {
      objectAssignProperty(window, tagArgsToString(args[0], ...args.slice(1)), quickElement);
    } else if (args.length === 1) {
      objectAssignProperty(window, args[0], quickElement);
    }
  };
  // @ts-ignore
  const setAlias = new Proxy(nullFunction, {
    apply(target: any, thisArg: any, argArray: any[]): void {
      return setAliasFunction(...argArray);
    },
    get(target: any, p: string | symbol, receiver: any): any {
      switch (p) {
        case 'apply':
          return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
        case 'bind':
          return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
        case 'call':
          return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
        case 'toString':
          return () => this.toString();
        // @ts-ignore
        case Symbol.toPrimitive:
          return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
        default:
          return (): void => setAliasFunction(p);
      }
    }
  });
  const objectProperty = (obj: object, ...propertyPath: (string | symbol)[]): [object, string | symbol] | undefined => {
    if (typeof obj === 'undefined' || obj === null) {
      return undefined;
    }
    let target = obj;
    const n = propertyPath.length - 1
    for (let i = 0; i < n; i++) {
      target = target[propertyPath[i]]
      if (typeof target === 'undefined' || target === null) {
        return undefined;
      }
    }
    return [target, propertyPath[n]];
  }
  const chainAction = (<E extends Element>(): (action: QuickAction<E>, ...contextPath: (string | symbol)[]) => any => {
    const createChainActionProxy = (action: QuickAction<E>, contextObject: any): any => {
      const targetFunction = () => void (0);
      targetFunction.chainedAction = action;
      targetFunction.contextObject = contextObject;
      // @ts-ignore
      targetFunction.proxy = new Proxy(targetFunction, {
        apply(target: any, thisArg: any, argArray: any[]): any {
          if (isQuickAction(targetFunction.contextObject)) {
            targetFunction.chainedAction.apply(thisArg, argArray);
          }
          const newContextObject = targetFunction.contextObject.apply(thisArg, argArray);
          if (typeof newContextObject === 'undefined' || newContextObject === null) {
            return newContextObject;
          }
          return createChainActionProxy(targetFunction.chainedAction, newContextObject);
        },
        get(target: any, p: string | symbol, receiver: any): any {
          switch (p) {
            case 'apply':
              return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
            case 'bind':
              return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
            case 'call':
              return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
            case 'toString':
              return () => this.toString();
            // @ts-ignore
            case Symbol.toPrimitive:
              return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
            case '__QE_QA__':
              return targetFunction.proxy;
            case '__QE_QA_PROXY__':
              return targetFunction.proxy;
            case '__QE_QA_PROXY_IS_QUICK_ACTION__':
              return isQuickAction(targetFunction.contextObject);
            default:
              const newContextObject = targetFunction.contextObject[p]
              if (typeof newContextObject === 'undefined' || newContextObject === null) {
                return newContextObject;
              }
              return createChainActionProxy(targetFunction.chainedAction, newContextObject);
          }
        }
      });
      return targetFunction.proxy;
    };
    return (action: QuickAction<E>, ...contextPath: (string | symbol)[]): any => {
      const targetFunction = () => void (0);
      targetFunction.action = action;
      targetFunction.baseObject = quickElement;
      if (contextPath.length > 0) {
        const prop = objectProperty(targetFunction.baseObject, ...contextPath);
        if (!prop) {
          return undefined;
        }
        targetFunction.contextObject = prop[0][prop[1]];
      } else {
        targetFunction.contextObject = targetFunction.baseObject;
      }
      targetFunction.createProxy = createChainActionProxy;
      // @ts-ignore
      targetFunction.proxy = new Proxy(targetFunction, {
        apply(target: any, thisArg: any, argArray: any[]): any {
          return action.apply(thisArg, argArray);
        },
        get(target: any, p: string | symbol, receiver: any): any {
          switch (p) {
            case 'apply':
              return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
            case 'bind':
              return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
            case 'call':
              return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
            case 'toString':
              return () => this.toString();
            // @ts-ignore
            case Symbol.toPrimitive:
              return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
            case '__QE_QA__':
              return targetFunction.proxy;
            case '__QE_QA_PROXY__':
              return undefined;
            case '_':
              return targetFunction.createProxy(targetFunction.action, targetFunction.baseObject);
            default:
              return targetFunction.createProxy(targetFunction.action, targetFunction.contextObject)[p];
          }
        }
      });
      return targetFunction.proxy;
    }
  })();
  const getObjectProperty = (obj: object, ...propertyPath: (string | symbol)[]): any => {
    const prop = objectProperty(obj, ...propertyPath);
    if (!prop) {
      return undefined;
    }
    return prop[0][prop[1]];
  }
  const setObjectProperty = (obj: object, value: any, ...propertyPath: (string | symbol)[]): void => {
    const prop = objectProperty(obj, ...propertyPath);
    if (!prop) {
      return undefined;
    }
    prop[0][prop[1]] = value;
  }
  const callObjectProperty = (obj: object, argArray: any[], ...propertyPath: (string | symbol)[]): any => {
    const prop = objectProperty(obj, ...propertyPath);
    if (!prop) {
      return undefined;
    }
    return prop[0][prop[1]](...argArray);
  }
  const propertyGetter = (...targetPath: (string | symbol)[]): any => {
    const targetFunction = () => void (0);
    targetFunction.targetPath = targetPath;
    // @ts-ignore
    return new Proxy(targetFunction, {
      apply(target: any, thisArg: any, argArray: any[]): (e: object) => void {
        if (argArray.length === 1 && typeof argArray[0] === 'function') {
          return chainAction(e => argArray[0](getObjectProperty(e, ...targetFunction.targetPath)), 'property', 'get', ...targetPath.slice(0, -1));
        }
        return () => {
        };
      },
      get(target: any, p: string | symbol, receiver: any): any {
        switch (p) {
          case 'apply':
            return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
          case 'bind':
            return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
          case 'call':
            return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
          case 'toString':
            return () => this.toString();
          // @ts-ignore
          case Symbol.toPrimitive:
            return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
          default:
            return propertyGetter(...targetPath, p);
        }
      }
    });
  }
  const propertySetter = (...targetPath: (string | symbol)[]): any => {
    const targetFunction = () => void (0);
    targetFunction.targetPath = targetPath;
    // @ts-ignore
    return new Proxy(targetFunction, {
      apply(target: any, thisArg: any, argArray: any[]): (e: object) => void {
        if (isTagFunctionArgs(argArray)) {
          return chainAction(e => setObjectProperty(e, tagArgsToString(argArray[0], ...argArray.slice(1)), ...targetFunction.targetPath), 'property', 'set', ...targetPath.slice(0, -1));
        }
        if (argArray.length === 1) {
          return chainAction(e => setObjectProperty(e, argArray[0], ...targetFunction.targetPath), 'property', 'set', ...targetPath.slice(0, -1));
        }
        return () => {
        };
      },
      get(target: any, p: string | symbol, receiver: any): any {
        switch (p) {
          case 'apply':
            return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
          case 'bind':
            return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
          case 'call':
            return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
          case 'toString':
            return () => this.toString();
          // @ts-ignore
          case Symbol.toPrimitive:
            return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
          default:
            return propertySetter(...targetPath, p);
        }
      }
    });
  }
  const propertyCaller = (...targetPath: (string | symbol)[]): any => {
    const targetFunction = () => void (0);
    targetFunction.targetPath = targetPath;
    // @ts-ignore
    return new Proxy(targetFunction, {
      apply(target: any, thisArg: any, argArray: any[]): (e: object) => void {
        if (isTagFunctionArgs(argArray)) {
          return chainAction(e => callObjectProperty(e, [tagArgsToString(argArray[0], ...argArray.slice(1))], ...targetFunction.targetPath), 'property', 'callFunc', ...targetPath.slice(0, -1));
        }
        return chainAction(e => callObjectProperty(e, argArray, ...targetFunction.targetPath), 'property', 'callFunc', ...targetPath.slice(0, -1));
      },
      get(target: any, p: string | symbol, receiver: any): any {
        switch (p) {
          case 'apply':
            return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
          case 'bind':
            return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
          case 'call':
            return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
          case 'toString':
            return () => this.toString();
          // @ts-ignore
          case Symbol.toPrimitive:
            return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
          default:
            return propertyCaller(...targetPath, p);
        }
      }
    });
  }
  const untilTriggered = <E extends Element>(triggerSetter: (trigger: () => void) => void): (...actions: QuickAction<E>[]) => QuickAction<E> => (...actions: QuickAction<E>[]) => (e: E) => triggerSetter(() => actions.forEach(action => action(e)));
  const qeProperties: any = {};
  const elementAddClass = <E extends Element>(...tokens: string[]): QuickAction<E> => chainAction(e => e.classList.add(...processClassNames(...tokens)));
  const elementRemoveClass = <E extends Element>(...tokens: string[]): QuickAction<E> => chainAction(e => e.classList.remove(...processClassNames(...tokens)));
  const elementGetAttribute = <E extends Element>(qualifiedName: string, valueConsumer: (value: string) => void): QuickAction<E> => chainAction(e => valueConsumer(e.getAttribute(qualifiedName)));
  const elementSetAttribute = <E extends Element>(qualifiedName: string, value: string): QuickAction<E> => chainAction(e => e.setAttribute(qualifiedName, value));
  const elementProperty = (() => {
    const func = () => () => void (0);
    // @ts-ignore
    func.get = new Proxy(nullFunction, {
      apply(): void {
      },
      get(target: any, p: string | symbol, receiver: any): any {
        switch (p) {
          case 'apply':
            return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
          case 'bind':
            return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
          case 'call':
            return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
          case 'toString':
            return () => this.toString();
          // @ts-ignore
          case Symbol.toPrimitive:
            return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
          default:
            return propertyGetter(p);
        }
      }
    })
    // @ts-ignore
    func.set = new Proxy(nullFunction, {
      apply(): void {
      },
      get(target: any, p: string | symbol, receiver: any): any {
        switch (p) {
          case 'apply':
            return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
          case 'bind':
            return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
          case 'call':
            return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
          case 'toString':
            return () => this.toString();
          // @ts-ignore
          case Symbol.toPrimitive:
            return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
          default:
            return propertySetter(p);
        }
      }
    })
    // @ts-ignore
    func.callFunc = new Proxy(nullFunction, {
      apply(): void {
      },
      get(target: any, p: string | symbol, receiver: any): any {
        switch (p) {
          case 'apply':
            return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
          case 'bind':
            return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
          case 'call':
            return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
          case 'toString':
            return () => this.toString();
          // @ts-ignore
          case Symbol.toPrimitive:
            return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
          default:
            return propertyCaller(p);
        }
      }
    })
    return func;
  })()
  let documentReadyEventListenerAdded = false;
  const onReadyStateChange = () => {
    if (document.readyState !== "complete") {
      return;
    }
    ['head', 'body'].forEach(t => {
      if (actionQueues[t]) {
        const element = document[t];
        let qe;
        if (!element) {
          qe = createElement(t as any);
          fromElement(document as any)(qe);
        } else {
          qe = fromElement(element)
        }
        actionQueues[t].forEach(e => qe(...e));
      }
    });
  };
  const actionQueues = {};
  const queryToAction = (query: QueryObject, ...args: any[]) => e => {
    query.result = fromElement(e).query(...args);
    const processor = {
      observer: (observer) => {
        observer(query.result);
      },
      action: (action) => {
        query.result(action);
      }
    }
    query.typedItemQueue.forEach(typedItem => processor[typedItem.type](typedItem.item));
  }
  const createQuickElementProxy = (actionQueue: any[], elementGetter: () => any) => {
    // @ts-ignore
    const proxy = new Proxy(nullFunction, {
      apply(target: any, thisArg: any, argArray: any[]): any {
        actionQueue.push(...argArray);
        return proxy;
      },
      get(target: any, p: string | symbol, receiver: any): any {
        switch (p) {
          case 'apply':
            return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
          case 'bind':
            return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
          case 'call':
            return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
          case 'toString':
            return () => this.toString();
          // @ts-ignore
          case Symbol.toPrimitive:
            return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
          case 'e':
            return elementGetter();
          case 'query':
            return (...args: any[]) => {
              const query: QueryObject = {
                typedItemQueue: [],
              };
              actionQueue.push(queryToAction(query, ...args));
              return createQuickElementArrayProxy(query.typedItemQueue, () => query.result?.a);
            }
          default:
            return undefined;
        }
      }
    });
    return proxy;
  }
  const createQuickElementArrayProxy = (typedItemQueue: { type: 'observer' | 'action'; item: any; }[], arrayGetter: () => QuickElement<any>[]) => {
    // @ts-ignore
    const proxy = new Proxy(nullFunction, {
      apply(target: any, thisArg: any, argArray: any[]): any {
        typedItemQueue.push(...argArray.map(arg => ({type: 'action', item: arg}) as { type: 'action'; item: any; }));
        return proxy;
      },
      get(target: any, p: string | symbol, receiver: any): any {
        switch (p) {
          case 'apply':
            return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
          case 'bind':
            return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
          case 'call':
            return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
          case 'toString':
            return () => this.toString();
          // @ts-ignore
          case Symbol.toPrimitive:
            return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
          case 'a':
            return arrayGetter();
          case 'query':
            return (...args: any[]) => {
              const query: QueryObject = {
                typedItemQueue: [],
              };
              typedItemQueue.push({
                type: 'observer',
                item: qea => {
                  query.result = qea.query(...args);
                  const processor = {
                    observer: (observer) => {
                      observer(query.result);
                    },
                    action: (action) => {
                      query.result(action);
                    }
                  }
                  query.typedItemQueue.forEach(typedItem => processor[typedItem.type](typedItem.item));
                }
              });
              return createQuickElementArrayProxy(query.typedItemQueue, () => query.result?.a);
            }
          default:
            return undefined;
        }
      }
    });
    return proxy;
  }
  const createDocumentQuickElementProxy = (tagName: string) => {
    // @ts-ignore
    return new Proxy(nullFunction, {
      apply(target: any, thisArg: any, argArray: any[]): any {
        if (document.readyState === "complete") {
          return fromElement(document[tagName])(...argArray);
        }
        const aq = [...argArray];
        if (!actionQueues[tagName]) {
          actionQueues[tagName] = [];
        }
        actionQueues[tagName].push(aq);
        if (!documentReadyEventListenerAdded) {
          document.addEventListener('readystatechange', () => onReadyStateChange());
          documentReadyEventListenerAdded = true;
        }
        return createQuickElementProxy(aq, () => document[tagName]);
      },
      get(target: any, p: string | symbol, receiver: any): any {
        switch (p) {
          case 'apply':
            return (thisArg, argsArray) => this.apply(target, thisArg, argsArray);
          case 'bind':
            return (thisArg, ...prependedArgsArray) => (...argsArray) => this.apply(target, thisArg, [...prependedArgsArray, ...argsArray]);
          case 'call':
            return (thisArg, ...argsArray) => this.apply(target, thisArg, argsArray);
          case 'toString':
            return () => this.toString();
          // @ts-ignore
          case Symbol.toPrimitive:
            return (hint) => hint === 'number' ? NaN : this.get(target, 'toString', receiver)();
          case 'e':
            return document[tagName];
          case 'query':
            return (...args: any[]) => {
              if (document.readyState === "complete") {
                return fromElement(document[tagName]).query(...args);
              }
              if (!actionQueues[tagName]) {
                actionQueues[tagName] = [];
              }
              const query: QueryObject = {
                typedItemQueue: [],
              };
              actionQueues[tagName].push([queryToAction(query, ...args)]);
              if (!documentReadyEventListenerAdded) {
                document.addEventListener('readystatechange', () => onReadyStateChange());
                documentReadyEventListenerAdded = true;
              }
              return createQuickElementArrayProxy(query.typedItemQueue, () => query.result?.a);
            }
          default:
            return undefined;
        }
      }
    })
  }
  const bodyElement = createDocumentQuickElementProxy('body');
  const headElement = createDocumentQuickElementProxy('head');
  window[quickElement] = quickElement;
  if (typeof window['$'] === 'undefined') objectAssignProperty(window, '$', quickElement);
  qeProperties.ALIAS = setAlias;
  qeProperties.BODY = bodyElement;
  qeProperties.CODE = fromCode;
  qeProperties.HEAD = headElement;
  qeProperties.HTML = fromHTML;
  qeProperties.QUERY = queryDocument;
  qeProperties.UNTIL = untilTriggered;
  qeProperties.VERSION = returnVersion;
  qeProperties.a = elementSetAttribute;
  qeProperties.attr = elementSetAttribute;
  qeProperties.getAttr = elementGetAttribute;
  qeProperties.getAttribute = elementGetAttribute;
  qeProperties.setAttr = elementSetAttribute;
  qeProperties.setAttribute = elementSetAttribute;
  qeProperties.c = elementAddClass;
  qeProperties.ac = elementAddClass;
  qeProperties.addClass = elementAddClass;
  qeProperties.rc = elementRemoveClass;
  qeProperties.removeClass = elementRemoveClass;
  qeProperties.s = elementProperty.set.style;
  qeProperties.setStyle = elementProperty.set.style;
  qeProperties.p = elementProperty;
  qeProperties.prop = elementProperty;
  qeProperties.property = elementProperty;
  qeProperties.null = chainAction(nullFunction);
})();
