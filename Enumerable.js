var EnumerableModule;
(function (EnumerableModule) {
    var __init = function (count, initializer) {
        if (typeof initializer === "undefined") {
            initializer = function (ix) {
                return ix;
            };
        }

        var items = new Array(count);
        __forEach(items, function (_, ix) {
            return items[ix] = initializer(ix);
        });

        return items;
    };

    var __zero = function (count, zeroVal) {
        return __init(count, function (_) {
            return zeroVal;
        });
    };

    var __createEnumerator = function (data, step) {
        if (typeof step === "undefined") { step = 1; }
        if (isNaN(step) || step < 1)
            throw "Step must be a positive number";
        var index = -1;
        var moveNext = function () {
            var nextIndex = index + step;
            if (nextIndex >= data.length)
                return false;
            index = nextIndex;
            return true;
        };

        return {
            MoveNext: moveNext,
            Current: function () {
                return data[index];
            }
        };
    };

    var __isNullOrEmpty = function (data) {
        return data === null || data.length === 0;
    };

    var __forEach = function (data, action) {
        if (__isNullOrEmpty(data))
            return;
        var enumerator = __createEnumerator(data);
        for (var ix = 0; enumerator.MoveNext(); ix++) {
            action(enumerator.Current(), ix);
        }
    };

    var __map = function (data, projector) {
        if (__isNullOrEmpty(data))
            return [];

        var mappings = [];
        __forEach(data, function (item, ix) {
            return mappings[ix] = projector(item);
        });

        return mappings;
    };

    var __reduce = function (data, reducer, start) {
        if (__isNullOrEmpty(data))
            return start;

        var reduction = start;
        __forEach(data, function (item, _) {
            return reduction = reducer(reduction, item);
        });

        return reduction;
    };

    var __minBy = function (data, projector) {
        if (__isNullOrEmpty(data))
            return {};

        var reducer = function (min, current) {
            return (projector(current) < projector(min)) ? current : min;
        };

        return __reduce(data, reducer, projector(data[0]));
    };

    var __maxBy = function (data, projector) {
        if (__isNullOrEmpty(data))
            return {};

        var reducer = function (max, current) {
            return (projector(max) > projector(current)) ? current : max;
        };

        return __reduce(data, reducer, projector(data[0]));
    };

    var __sumBy = function (data, projector) {
        if (__isNullOrEmpty(data))
            return NaN;

        return __reduce(data, function (reduction, current) {
            return reduction + projector(current);
        }, 0.0);
    };

    var __averageBy = function (data, projector) {
        if (__isNullOrEmpty(data))
            return NaN;

        return __sumBy(data, projector) / data.length;
    };

    var __distinctBy = function (data, projector) {
        if (__isNullOrEmpty(data))
            return [];

        var values = __reduce(data, function (reduction, current) {
            var value = projector(current);
            if (reduction.indexOf(value) === -1)
                reduction[reduction.length] = value;
            return reduction;
        }, []);

        return values;
    };

    var __filterBy = function (data, predicate) {
        if (__isNullOrEmpty(data))
            return [];

        var values = __reduce(data, function (reduction, current) {
            if (predicate(current))
                reduction[reduction.length] = current;
            return reduction;
        }, []);

        return values;
    };

    var __firstBy = function (data, predicate) {
        if (__isNullOrEmpty(data))
            return {};

        var enumerator = __createEnumerator(data);

        while (enumerator.MoveNext()) {
            var current = enumerator.Current();
            if (predicate(current))
                return current;
        }

        return {};
    };

    var __lastBy = function (data, predicate) {
        if (__isNullOrEmpty(data))
            return {};

        var last = null;
        __forEach(data, function (item, _) {
            if (predicate(item))
                last = item;
        });

        return last;
    };

    var __slice = function (data, first, last) {
        if (__isNullOrEmpty(data))
            return [];

        return Array.prototype.slice.apply(data, [first, last]);
    };

    var __head = function (data) {
        if (__isNullOrEmpty(data))
            return {};

        return data[0];
    };

    var __tail = function (data) {
        if (__isNullOrEmpty(data) || data.length < 2)
            return [];

        return __slice(data, 1, data.length);
    };

    var __containsBy = function (data, predicate) {
        if (__isNullOrEmpty(data))
            return false;

        return __firstBy(data, predicate) !== null;
    };

    var __allBy = function (data, predicate) {
        if (__isNullOrEmpty(data))
            return false;

        var enumerator = __createEnumerator(data);
        while (enumerator.MoveNext()) {
            if (!predicate(enumerator.Current()))
                return false;
        }

        return true;
    };

    var __anyBy = function (data, predicate) {
        if (__isNullOrEmpty(data))
            return false;

        var enumerator = __createEnumerator(data);
        while (enumerator.MoveNext()) {
            if (predicate(enumerator.Current()))
                return true;
        }

        return false;
    };

    var Enumerable = (function () {
        function Enumerable(data) {
            var _this = this;
            this.forEach = function (action) {
                __forEach(_this._data, action);
            };
            this.map = function (projector) {
                return new Enumerable(__map(_this._data, projector));
            };
            this.reduce = function (reducer, start) {
                return __reduce(_this._data, reducer, start);
            };
            this.minBy = function (projector) {
                return __minBy(_this._data, projector);
            };
            this.maxBy = function (projector) {
                return __maxBy(_this._data, projector);
            };
            this.sumBy = function (projector) {
                return __sumBy(_this._data, projector);
            };
            this.averageBy = function (projector) {
                return __averageBy(_this._data, projector);
            };
            this.distinctBy = function (projector) {
                return new Enumerable(__distinctBy(_this._data, projector));
            };
            this.filterBy = function (predicate) {
                return new Enumerable(__filterBy(_this._data, predicate));
            };
            this.firstBy = function (predicate) {
                return __firstBy(_this._data, predicate);
            };
            this.lastBy = function (predicate) {
                return __lastBy(_this._data, predicate);
            };
            this.slice = function (first, last) {
                return new Enumerable(__slice(_this._data, first, last));
            };
            this.head = function () {
                return __head(_this._data);
            };
            this.tail = function () {
                return new Enumerable(__tail(_this._data));
            };
            this.containsBy = function (predicate) {
                return __containsBy(_this._data, predicate);
            };
            this.allBy = function (predicate) {
                return __allBy(_this._data, predicate);
            };
            this.anyBy = function (predicate) {
                return __anyBy(_this._data, predicate);
            };
            this._data = data;
        }
        Enumerable.zero = function (count, zeroVal) {
            return new Enumerable(__zero(count, zeroVal));
        };

        Object.defineProperty(Enumerable.prototype, "length", {
            get: function () {
                return this._data.length;
            },
            enumerable: true,
            configurable: true
        });
        Enumerable.init = function (count, initializer) {
            return new Enumerable(__init(count, initializer));
        };
        return Enumerable;
    })();
    EnumerableModule.Enumerable = Enumerable;
})(EnumerableModule || (EnumerableModule = {}));
//# sourceMappingURL=Enumerable.js.map
