var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
(function () {
    var version = '1.2.0';
    var returnVersion = function () { return version; };
    var nullFunction = function () { return void (0); };
    var tagArgsToString = function (strings) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var stringList = [];
        var sl = strings.length;
        var al = args.length;
        var si = 0;
        var ai = 0;
        while (sl - si > 0 || al - ai > 0) {
            sl - si > 0 && stringList.push(strings[si++]);
            al - ai > 0 && stringList.push(args[ai++]);
        }
        return stringList.join('');
    };
    var isTagFunctionArgs = function (args) {
        return args.length > 0 && Array.isArray(args[0]) && args[0].every(function (v) { return typeof v === 'string'; });
    };
    var isQuickElement = function (e) { return typeof e === 'function' && typeof e.e !== 'undefined'; };
    var isQuickElementArray = function (a) { return typeof a === 'function' && typeof a.a !== 'undefined'; };
    var editElement = function (target) {
        var e = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            e[_i - 1] = arguments[_i];
        }
        var el = e.length;
        var string = '';
        for (var i = 0; i < el; i++) {
            var elem = e[i];
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
                        editElement.apply(void 0, __spreadArray([target], elem.a, false));
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
                        editElement.apply(void 0, __spreadArray([target], elem, false));
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
    var applyToElement = function (target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (isTagFunctionArgs(args)) {
            return editElement(target, tagArgsToString.apply(void 0, __spreadArray([args[0]], args.slice(1), false)));
        }
        return editElement.apply(void 0, __spreadArray([target], args, false));
    };
    var nodeListToArray = function (nodeList) {
        var result = [];
        nodeList.forEach(function (n) { return result.push(n); });
        return result;
    };
    var parseHTML = function (html) {
        var tmpl = document.createElement('template');
        tmpl.innerHTML = html;
        return nodeListToArray(tmpl.content.childNodes);
    };
    var nodesFromHTML = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (isTagFunctionArgs(args)) {
            return parseHTML(tagArgsToString.apply(void 0, __spreadArray([args[0]], args.slice(1), false)));
        }
        return parseHTML(args.join(''));
    };
    var nodesFromQuery = function (target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (isTagFunctionArgs(args)) {
            return nodeListToArray(target.querySelectorAll(tagArgsToString.apply(void 0, __spreadArray([args[0]], args.slice(1), false))));
        }
        return nodeListToArray(target.querySelectorAll(args.join('')));
    };
    var fromElement = function (e) {
        var qe;
        qe = (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            applyToElement.apply(void 0, __spreadArray([qe.e], args, false));
            return qe;
        });
        qe.e = e;
        qe.query = queryElement(qe);
        return qe;
    };
    var fromQuickElements = function (a) {
        var qea;
        qea = (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            qea.a.forEach(function (e) { return applyToElement.apply(void 0, __spreadArray([e.e], args, false)); });
            return qea;
        });
        qea.a = a;
        qea.query = queryElements(qea);
        return qea;
    };
    var fromHTML = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return fromQuickElements(nodesFromHTML.apply(void 0, args).map(function (node) { return fromElement(node); }));
    };
    var fromQuery = function (target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return fromQuickElements(nodesFromQuery.apply(void 0, __spreadArray([target], args, false)).map(function (node) { return fromElement(node); }));
    };
    var fromArray = function (a) {
        var quickElements = [];
        for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
            var elem = a_1[_i];
            switch (typeof elem) {
                case 'object':
                    if (Array.isArray(elem)) {
                        quickElements.push.apply(quickElements, fromArray(elem).a);
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
                        quickElements.push.apply(quickElements, elem.a);
                        continue;
                    }
                    continue;
                case 'string':
                    quickElements.push(createElement(elem));
                    continue;
                default:
                    break;
            }
        }
        return fromQuickElements(quickElements);
    };
    var fromCode = function (code) {
        var accumulated = [];
        var consume = function () {
            var e = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                e[_i] = arguments[_i];
            }
            return accumulated.push.apply(accumulated, e);
        };
        code(function () {
            var e = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                e[_i] = arguments[_i];
            }
            return consume.apply(void 0, e);
        });
        accumulated.push(function (element) { return consume = function () {
            var e = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                e[_i] = arguments[_i];
            }
            return fromElement(element)(e);
        }; });
        return accumulated;
    };
    var createElement = function (tagName) { return fromElement(document.createElement(tagName)); };
    var processClassNames = function () {
        var classNames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            classNames[_i] = arguments[_i];
        }
        var result = [];
        classNames.forEach(function (n) { return result.push.apply(result, n.split(' ').filter(function (n) { return !!n; })); });
        return result;
    };
    // @ts-ignore
    var quickElement = new Proxy(nullFunction, {
        apply: function (target, thisArg, argArray) {
            if (isTagFunctionArgs(argArray)) {
                return createElement(tagArgsToString.apply(void 0, __spreadArray([argArray[0]], argArray.slice(1), false)));
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
                        return createElement(argArray[0]);
                }
            }
            if (argArray.length > 1) {
                return fromArray(argArray);
            }
            return null;
        },
        get: function (target, p, receiver) {
            var _this = this;
            switch (p) {
                case 'apply':
                    return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                case 'bind':
                    return function (thisArg) {
                        var prependedArgsArray = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            prependedArgsArray[_i - 1] = arguments[_i];
                        }
                        return function () {
                            var argsArray = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                argsArray[_i] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                        };
                    };
                case 'call':
                    return function (thisArg) {
                        var argsArray = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            argsArray[_i - 1] = arguments[_i];
                        }
                        return _this.apply(target, thisArg, argsArray);
                    };
                case 'toString':
                    return function () { return 'quickElement'; };
                // @ts-ignore
                case Symbol.toPrimitive:
                    return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                case '__PROPERTIES__':
                    return qeProperties;
                default:
                    var qeProp_1 = qeProperties[p];
                    if (typeof qeProp_1 === 'function') {
                        // @ts-ignore
                        return new Proxy(nullFunction, {
                            apply: function (target, thisArg, argArray) {
                                if (isTagFunctionArgs(argArray)) {
                                    return qeProp_1(tagArgsToString.apply(void 0, __spreadArray([argArray[0]], argArray.slice(1), false)));
                                }
                                return qeProp_1.apply(void 0, argArray);
                            },
                            get: function (target, p, receiver) {
                                var _this = this;
                                switch (p) {
                                    case 'apply':
                                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                                    case 'bind':
                                        return function (thisArg) {
                                            var prependedArgsArray = [];
                                            for (var _i = 1; _i < arguments.length; _i++) {
                                                prependedArgsArray[_i - 1] = arguments[_i];
                                            }
                                            return function () {
                                                var argsArray = [];
                                                for (var _i = 0; _i < arguments.length; _i++) {
                                                    argsArray[_i] = arguments[_i];
                                                }
                                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                                            };
                                        };
                                    case 'call':
                                        return function (thisArg) {
                                            var argsArray = [];
                                            for (var _i = 1; _i < arguments.length; _i++) {
                                                argsArray[_i - 1] = arguments[_i];
                                            }
                                            return _this.apply(target, thisArg, argsArray);
                                        };
                                    case 'toString':
                                        return function () { return _this.toString(); };
                                    // @ts-ignore
                                    case Symbol.toPrimitive:
                                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                                    default:
                                        return qeProp_1[p];
                                }
                            },
                            set: function (target, p, value) {
                                qeProp_1[p] = value;
                                return true;
                            }
                        });
                    }
                    if (typeof p === 'string') {
                        // @ts-ignore
                        return new Proxy(nullFunction, {
                            apply: function (target, thisArg, argArray) {
                                if (isTagFunctionArgs(argArray)) {
                                    return elementSetAttribute(p, tagArgsToString.apply(void 0, __spreadArray([argArray[0]], argArray.slice(1), false)));
                                }
                                if (argArray.length === 1) {
                                    var arg = argArray[0];
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
                                return function () {
                                };
                            },
                            get: function (target, p, receiver) {
                                var _this = this;
                                switch (p) {
                                    case 'apply':
                                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                                    case 'bind':
                                        return function (thisArg) {
                                            var prependedArgsArray = [];
                                            for (var _i = 1; _i < arguments.length; _i++) {
                                                prependedArgsArray[_i - 1] = arguments[_i];
                                            }
                                            return function () {
                                                var argsArray = [];
                                                for (var _i = 0; _i < arguments.length; _i++) {
                                                    argsArray[_i] = arguments[_i];
                                                }
                                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                                            };
                                        };
                                    case 'call':
                                        return function (thisArg) {
                                            var argsArray = [];
                                            for (var _i = 1; _i < arguments.length; _i++) {
                                                argsArray[_i - 1] = arguments[_i];
                                            }
                                            return _this.apply(target, thisArg, argsArray);
                                        };
                                    case 'toString':
                                        return function () { return _this.toString(); };
                                    // @ts-ignore
                                    case Symbol.toPrimitive:
                                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                                }
                            }
                        });
                    }
                    return function () { return function () {
                    }; };
            }
        },
    });
    var queryDocument = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return fromQuery.apply(void 0, __spreadArray([document], args, false));
    };
    var queryElement = function (target) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return fromQuery.apply(void 0, __spreadArray([target.e], args, false));
    }; };
    if (!Array.prototype.flat) {
        Array.prototype.flat = function (depth) {
            if (typeof depth === 'undefined') {
                depth = 1;
            }
            var flatten = function (array, depth) {
                if (depth < 1) {
                    return array.slice();
                }
                return array.reduce(function (accumulator, currentValue) {
                    return accumulator.concat(Array.isArray(currentValue) ? flatten(currentValue, depth - 1) : currentValue);
                }, []);
            };
            return flatten(this, depth);
        };
    }
    var queryElements = function (targets) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return fromQuickElements(targets.a.map(function (e) { return fromQuery.apply(void 0, __spreadArray([e.e], args, false)).a; }).flat(1));
    }; };
    var objectAssignProperty = function (o, p, value) {
        var _a;
        if (typeof ((_a = window.Object) === null || _a === void 0 ? void 0 : _a.defineProperty) === 'function') {
            Object.defineProperty(o, p, { value: value });
        }
        else {
            o[p] = value;
        }
    };
    var setAliasFunction = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (isTagFunctionArgs(args)) {
            objectAssignProperty(window, tagArgsToString.apply(void 0, __spreadArray([args[0]], args.slice(1), false)), quickElement);
        }
        else if (args.length === 1) {
            objectAssignProperty(window, args[0], quickElement);
        }
    };
    // @ts-ignore
    var setAlias = new Proxy(nullFunction, {
        apply: function (target, thisArg, argArray) {
            return setAliasFunction.apply(void 0, argArray);
        },
        get: function (target, p, receiver) {
            var _this = this;
            switch (p) {
                case 'apply':
                    return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                case 'bind':
                    return function (thisArg) {
                        var prependedArgsArray = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            prependedArgsArray[_i - 1] = arguments[_i];
                        }
                        return function () {
                            var argsArray = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                argsArray[_i] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                        };
                    };
                case 'call':
                    return function (thisArg) {
                        var argsArray = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            argsArray[_i - 1] = arguments[_i];
                        }
                        return _this.apply(target, thisArg, argsArray);
                    };
                case 'toString':
                    return function () { return _this.toString(); };
                // @ts-ignore
                case Symbol.toPrimitive:
                    return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                default:
                    return function () { return setAliasFunction(p); };
            }
        }
    });
    var objectProperty = function (obj) {
        var propertyPath = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            propertyPath[_i - 1] = arguments[_i];
        }
        if (typeof obj === 'undefined' || obj === null) {
            return undefined;
        }
        var target = obj;
        var n = propertyPath.length - 1;
        for (var i = 0; i < n; i++) {
            target = target[propertyPath[i]];
            if (typeof target === 'undefined' || target === null) {
                return undefined;
            }
        }
        return [target, propertyPath[n]];
    };
    var getObjectProperty = function (obj) {
        var propertyPath = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            propertyPath[_i - 1] = arguments[_i];
        }
        var prop = objectProperty.apply(void 0, __spreadArray([obj], propertyPath, false));
        if (!prop) {
            return undefined;
        }
        return prop[0][prop[1]];
    };
    var setObjectProperty = function (obj, value) {
        var propertyPath = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            propertyPath[_i - 2] = arguments[_i];
        }
        var prop = objectProperty.apply(void 0, __spreadArray([obj], propertyPath, false));
        if (!prop) {
            return undefined;
        }
        prop[0][prop[1]] = value;
    };
    var callObjectProperty = function (obj, argArray) {
        var _a;
        var propertyPath = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            propertyPath[_i - 2] = arguments[_i];
        }
        var prop = objectProperty.apply(void 0, __spreadArray([obj], propertyPath, false));
        if (!prop) {
            return undefined;
        }
        return (_a = prop[0])[prop[1]].apply(_a, argArray);
    };
    var propertyGetter = function () {
        var targetPath = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            targetPath[_i] = arguments[_i];
        }
        var targetFunction = function () { return void (0); };
        targetFunction.targetPath = targetPath;
        // @ts-ignore
        return new Proxy(targetFunction, {
            apply: function (target, thisArg, argArray) {
                if (argArray.length === 1 && typeof argArray[0] === 'function') {
                    return function (e) { return argArray[0](getObjectProperty.apply(void 0, __spreadArray([e], targetFunction.targetPath, false))); };
                }
                return function () {
                };
            },
            get: function (target, p, receiver) {
                var _this = this;
                switch (p) {
                    case 'apply':
                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                    case 'bind':
                        return function (thisArg) {
                            var prependedArgsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                prependedArgsArray[_i - 1] = arguments[_i];
                            }
                            return function () {
                                var argsArray = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    argsArray[_i] = arguments[_i];
                                }
                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                            };
                        };
                    case 'call':
                        return function (thisArg) {
                            var argsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                argsArray[_i - 1] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, argsArray);
                        };
                    case 'toString':
                        return function () { return _this.toString(); };
                    // @ts-ignore
                    case Symbol.toPrimitive:
                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                    default:
                        return propertyGetter.apply(void 0, __spreadArray(__spreadArray([], targetPath, false), [p], false));
                }
            }
        });
    };
    var propertySetter = function () {
        var targetPath = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            targetPath[_i] = arguments[_i];
        }
        var targetFunction = function () { return void (0); };
        targetFunction.targetPath = targetPath;
        // @ts-ignore
        return new Proxy(targetFunction, {
            apply: function (target, thisArg, argArray) {
                if (isTagFunctionArgs(argArray)) {
                    return function (e) { return setObjectProperty.apply(void 0, __spreadArray([e, tagArgsToString.apply(void 0, __spreadArray([argArray[0]], argArray.slice(1), false))], targetFunction.targetPath, false)); };
                }
                if (argArray.length === 1) {
                    return function (e) { return setObjectProperty.apply(void 0, __spreadArray([e, argArray[0]], targetFunction.targetPath, false)); };
                }
                return function () {
                };
            },
            get: function (target, p, receiver) {
                var _this = this;
                switch (p) {
                    case 'apply':
                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                    case 'bind':
                        return function (thisArg) {
                            var prependedArgsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                prependedArgsArray[_i - 1] = arguments[_i];
                            }
                            return function () {
                                var argsArray = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    argsArray[_i] = arguments[_i];
                                }
                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                            };
                        };
                    case 'call':
                        return function (thisArg) {
                            var argsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                argsArray[_i - 1] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, argsArray);
                        };
                    case 'toString':
                        return function () { return _this.toString(); };
                    // @ts-ignore
                    case Symbol.toPrimitive:
                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                    default:
                        return propertySetter.apply(void 0, __spreadArray(__spreadArray([], targetPath, false), [p], false));
                }
            }
        });
    };
    var propertyCaller = function () {
        var targetPath = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            targetPath[_i] = arguments[_i];
        }
        var targetFunction = function () { return void (0); };
        targetFunction.targetPath = targetPath;
        // @ts-ignore
        return new Proxy(targetFunction, {
            apply: function (target, thisArg, argArray) {
                if (isTagFunctionArgs(argArray)) {
                    return function (e) { return callObjectProperty.apply(void 0, __spreadArray([e, [tagArgsToString.apply(void 0, __spreadArray([argArray[0]], argArray.slice(1), false))]], targetFunction.targetPath, false)); };
                }
                return function (e) { return callObjectProperty.apply(void 0, __spreadArray([e, argArray], targetFunction.targetPath, false)); };
            },
            get: function (target, p, receiver) {
                var _this = this;
                switch (p) {
                    case 'apply':
                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                    case 'bind':
                        return function (thisArg) {
                            var prependedArgsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                prependedArgsArray[_i - 1] = arguments[_i];
                            }
                            return function () {
                                var argsArray = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    argsArray[_i] = arguments[_i];
                                }
                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                            };
                        };
                    case 'call':
                        return function (thisArg) {
                            var argsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                argsArray[_i - 1] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, argsArray);
                        };
                    case 'toString':
                        return function () { return _this.toString(); };
                    // @ts-ignore
                    case Symbol.toPrimitive:
                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                    default:
                        return propertyCaller.apply(void 0, __spreadArray(__spreadArray([], targetPath, false), [p], false));
                }
            }
        });
    };
    var untilTriggered = function (triggerSetter) { return function () {
        var functions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            functions[_i] = arguments[_i];
        }
        return function (e) { return triggerSetter(function () { return functions.forEach(function (f) { return f(e); }); }); };
    }; };
    var qeProperties = {};
    var elementAddClass = function () {
        var tokens = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tokens[_i] = arguments[_i];
        }
        return function (e) {
            var _a;
            return (_a = e.classList).add.apply(_a, processClassNames.apply(void 0, tokens));
        };
    };
    var elementRemoveClass = function () {
        var tokens = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tokens[_i] = arguments[_i];
        }
        return function (e) {
            var _a;
            return (_a = e.classList).remove.apply(_a, processClassNames.apply(void 0, tokens));
        };
    };
    var elementGetAttribute = function (qualifiedName, valueConsumer) { return function (e) { return valueConsumer(e.getAttribute(qualifiedName)); }; };
    var elementSetAttribute = function (qualifiedName, value) { return function (e) { return e.setAttribute(qualifiedName, value); }; };
    var elementProperty = (function () {
        var func = function () { return function () { return void (0); }; };
        // @ts-ignore
        func.get = new Proxy(nullFunction, {
            apply: function () {
            },
            get: function (target, p, receiver) {
                var _this = this;
                switch (p) {
                    case 'apply':
                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                    case 'bind':
                        return function (thisArg) {
                            var prependedArgsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                prependedArgsArray[_i - 1] = arguments[_i];
                            }
                            return function () {
                                var argsArray = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    argsArray[_i] = arguments[_i];
                                }
                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                            };
                        };
                    case 'call':
                        return function (thisArg) {
                            var argsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                argsArray[_i - 1] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, argsArray);
                        };
                    case 'toString':
                        return function () { return _this.toString(); };
                    // @ts-ignore
                    case Symbol.toPrimitive:
                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                    default:
                        return propertyGetter(p);
                }
            }
        });
        // @ts-ignore
        func.set = new Proxy(nullFunction, {
            apply: function () {
            },
            get: function (target, p, receiver) {
                var _this = this;
                switch (p) {
                    case 'apply':
                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                    case 'bind':
                        return function (thisArg) {
                            var prependedArgsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                prependedArgsArray[_i - 1] = arguments[_i];
                            }
                            return function () {
                                var argsArray = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    argsArray[_i] = arguments[_i];
                                }
                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                            };
                        };
                    case 'call':
                        return function (thisArg) {
                            var argsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                argsArray[_i - 1] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, argsArray);
                        };
                    case 'toString':
                        return function () { return _this.toString(); };
                    // @ts-ignore
                    case Symbol.toPrimitive:
                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                    default:
                        return propertySetter(p);
                }
            }
        });
        // @ts-ignore
        func.callFunc = new Proxy(nullFunction, {
            apply: function () {
            },
            get: function (target, p, receiver) {
                var _this = this;
                switch (p) {
                    case 'apply':
                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                    case 'bind':
                        return function (thisArg) {
                            var prependedArgsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                prependedArgsArray[_i - 1] = arguments[_i];
                            }
                            return function () {
                                var argsArray = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    argsArray[_i] = arguments[_i];
                                }
                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                            };
                        };
                    case 'call':
                        return function (thisArg) {
                            var argsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                argsArray[_i - 1] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, argsArray);
                        };
                    case 'toString':
                        return function () { return _this.toString(); };
                    // @ts-ignore
                    case Symbol.toPrimitive:
                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                    default:
                        return propertyCaller(p);
                }
            }
        });
        return func;
    })();
    var documentReadyEventListenerAdded = false;
    var onReadyStateChange = function () {
        if (document.readyState !== "complete") {
            return;
        }
        ['head', 'body'].forEach(function (t) {
            if (actionQueues[t]) {
                var element = document[t];
                var qe_1;
                if (!element) {
                    qe_1 = createElement(t);
                    fromElement(document)(qe_1);
                }
                else {
                    qe_1 = fromElement(element);
                }
                actionQueues[t].forEach(function (e) { return qe_1.apply(void 0, e); });
            }
        });
    };
    var actionQueues = {};
    var queryToAction = function (query) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return function (e) {
            var _a;
            query.result = (_a = fromElement(e)).query.apply(_a, args);
            var processor = {
                observer: function (observer) {
                    observer(query.result);
                },
                action: function (action) {
                    query.result(action);
                }
            };
            query.typedItemQueue.forEach(function (typedItem) { return processor[typedItem.type](typedItem.item); });
        };
    };
    var createQuickElementProxy = function (actionQueue, elementGetter) {
        // @ts-ignore
        var proxy = new Proxy(nullFunction, {
            apply: function (target, thisArg, argArray) {
                actionQueue.push.apply(actionQueue, argArray);
                return proxy;
            },
            get: function (target, p, receiver) {
                var _this = this;
                switch (p) {
                    case 'apply':
                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                    case 'bind':
                        return function (thisArg) {
                            var prependedArgsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                prependedArgsArray[_i - 1] = arguments[_i];
                            }
                            return function () {
                                var argsArray = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    argsArray[_i] = arguments[_i];
                                }
                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                            };
                        };
                    case 'call':
                        return function (thisArg) {
                            var argsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                argsArray[_i - 1] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, argsArray);
                        };
                    case 'toString':
                        return function () { return _this.toString(); };
                    // @ts-ignore
                    case Symbol.toPrimitive:
                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                    case 'e':
                        return elementGetter();
                    case 'query':
                        return function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            var query = {
                                typedItemQueue: [],
                            };
                            actionQueue.push(queryToAction.apply(void 0, __spreadArray([query], args, false)));
                            return createQuickElementArrayProxy(query.typedItemQueue, function () { var _a; return (_a = query.result) === null || _a === void 0 ? void 0 : _a.a; });
                        };
                    default:
                        return undefined;
                }
            }
        });
        return proxy;
    };
    var createQuickElementArrayProxy = function (typedItemQueue, arrayGetter) {
        // @ts-ignore
        var proxy = new Proxy(nullFunction, {
            apply: function (target, thisArg, argArray) {
                typedItemQueue.push.apply(typedItemQueue, argArray.map(function (arg) { return ({ type: 'action', item: arg }); }));
                return proxy;
            },
            get: function (target, p, receiver) {
                var _this = this;
                switch (p) {
                    case 'apply':
                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                    case 'bind':
                        return function (thisArg) {
                            var prependedArgsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                prependedArgsArray[_i - 1] = arguments[_i];
                            }
                            return function () {
                                var argsArray = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    argsArray[_i] = arguments[_i];
                                }
                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                            };
                        };
                    case 'call':
                        return function (thisArg) {
                            var argsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                argsArray[_i - 1] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, argsArray);
                        };
                    case 'toString':
                        return function () { return _this.toString(); };
                    // @ts-ignore
                    case Symbol.toPrimitive:
                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                    case 'a':
                        return arrayGetter();
                    case 'query':
                        return function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            var query = {
                                typedItemQueue: [],
                            };
                            typedItemQueue.push({
                                type: 'observer',
                                item: function (qea) {
                                    query.result = qea.query.apply(qea, args);
                                    var processor = {
                                        observer: function (observer) {
                                            observer(query.result);
                                        },
                                        action: function (action) {
                                            query.result(action);
                                        }
                                    };
                                    query.typedItemQueue.forEach(function (typedItem) { return processor[typedItem.type](typedItem.item); });
                                }
                            });
                            return createQuickElementArrayProxy(query.typedItemQueue, function () { var _a; return (_a = query.result) === null || _a === void 0 ? void 0 : _a.a; });
                        };
                    default:
                        return undefined;
                }
            }
        });
        return proxy;
    };
    var createDocumentQuickElementProxy = function (tagName) {
        // @ts-ignore
        return new Proxy(nullFunction, {
            apply: function (target, thisArg, argArray) {
                if (document.readyState === "complete") {
                    return fromElement(document[tagName]).apply(void 0, argArray);
                }
                var aq = __spreadArray([], argArray, true);
                if (!actionQueues[tagName]) {
                    actionQueues[tagName] = [];
                }
                actionQueues[tagName].push(aq);
                if (!documentReadyEventListenerAdded) {
                    document.addEventListener('readystatechange', function () { return onReadyStateChange(); });
                    documentReadyEventListenerAdded = true;
                }
                return createQuickElementProxy(aq, function () { return document[tagName]; });
            },
            get: function (target, p, receiver) {
                var _this = this;
                switch (p) {
                    case 'apply':
                        return function (thisArg, argsArray) { return _this.apply(target, thisArg, argsArray); };
                    case 'bind':
                        return function (thisArg) {
                            var prependedArgsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                prependedArgsArray[_i - 1] = arguments[_i];
                            }
                            return function () {
                                var argsArray = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    argsArray[_i] = arguments[_i];
                                }
                                return _this.apply(target, thisArg, __spreadArray(__spreadArray([], prependedArgsArray, true), argsArray, true));
                            };
                        };
                    case 'call':
                        return function (thisArg) {
                            var argsArray = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                argsArray[_i - 1] = arguments[_i];
                            }
                            return _this.apply(target, thisArg, argsArray);
                        };
                    case 'toString':
                        return function () { return _this.toString(); };
                    // @ts-ignore
                    case Symbol.toPrimitive:
                        return function (hint) { return hint === 'number' ? NaN : _this.get(target, 'toString', receiver)(); };
                    case 'e':
                        return document[tagName];
                    case 'query':
                        return function () {
                            var _a;
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            if (document.readyState === "complete") {
                                return (_a = fromElement(document[tagName])).query.apply(_a, args);
                            }
                            if (!actionQueues[tagName]) {
                                actionQueues[tagName] = [];
                            }
                            var query = {
                                typedItemQueue: [],
                            };
                            actionQueues[tagName].push([queryToAction.apply(void 0, __spreadArray([query], args, false))]);
                            if (!documentReadyEventListenerAdded) {
                                document.addEventListener('readystatechange', function () { return onReadyStateChange(); });
                                documentReadyEventListenerAdded = true;
                            }
                            return createQuickElementArrayProxy(query.typedItemQueue, function () { var _a; return (_a = query.result) === null || _a === void 0 ? void 0 : _a.a; });
                        };
                    default:
                        return undefined;
                }
            }
        });
    };
    var bodyElement = createDocumentQuickElementProxy('body');
    var headElement = createDocumentQuickElementProxy('head');
    window[quickElement] = quickElement;
    if (typeof window['$'] === 'undefined')
        objectAssignProperty(window, '$', quickElement);
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
    qeProperties.null = nullFunction;
})();
