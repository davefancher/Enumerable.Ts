interface ICollection {
    [index: number]: any;
    length: number;
}

interface Predicate {
    (item: any): boolean;
}

interface Projection {
    (item: any): any;
}

interface Reduction {
    (state: any, item: any): any;
}

module EnumerableModule {
    export interface IteratorAction {
        (item: any, index: number): void;
    }

    interface Enumerator {
        MoveNext: () => boolean;
        Current: () => any;
    }

    var __init = (count: number, initializer: Projection) => {
        if (typeof initializer === "undefined") { initializer = ix => ix; }

        var items = new Array(count);
        __forEach(items, (_, ix) => items[ix] = initializer(ix));

        return items;
    };

    var __zero = (count, zeroVal?: any) => __init(count, _ => zeroVal);

    var __createEnumerator = (data: ICollection, step: number = 1): Enumerator => {
        if (isNaN(step) || step < 1) throw "Step must be a positive number";
        var index = -1;
        var moveNext = () => {
            var nextIndex = index + step;
            if (nextIndex >= data.length) return false;
            index = nextIndex;
            return true;
        };

        return {
            MoveNext: moveNext,
            Current: () => data[index]
        };
    }

    var __isNullOrEmpty = (data: ICollection) => data === null || data.length === 0;

    var __forEach = (data: ICollection, action: IteratorAction) => {
        if (__isNullOrEmpty(data)) return;
        var enumerator = __createEnumerator(data);
        for (var ix = 0; enumerator.MoveNext(); ix++) {
            action(enumerator.Current(), ix);
        }
    };

    var __map = (data: ICollection, projector: Projection) => {
        if (__isNullOrEmpty(data)) return [];

        var mappings = [];
        __forEach(data, (item, ix) => mappings[ix] = projector(item));

        return mappings;
    };

    var __reduce = (data: ICollection, reducer: Reduction, start) => {
        if (__isNullOrEmpty(data)) return start;

        var reduction = start;
        __forEach(data, (item, _) => reduction = reducer(reduction, item));

        return reduction;
    };

    var __minBy = (data: ICollection, projector: Projection) => {
        if (__isNullOrEmpty(data)) return {};

        var reducer = (min, current) => (projector(current) < projector(min)) ? current : min;

        return __reduce(data, reducer, projector(data[0]));
    };

    var __maxBy = (data: ICollection, projector: Projection) => {
        if (__isNullOrEmpty(data)) return {};

        var reducer = (max, current) => (projector(max) > projector(current)) ? current : max;

        return __reduce(data, reducer, projector(data[0]));
    };

    var __sumBy = (data: ICollection, projector: Projection) => {
        if (__isNullOrEmpty(data)) return NaN;

        return __reduce(data, (reduction, current) => reduction + projector(current), 0.0);
    };

    var __averageBy = (data: ICollection, projector: Projection) => {
        if (__isNullOrEmpty(data)) return NaN;

        return __sumBy(data, projector) / data.length;
    };

    var __distinctBy = (data: ICollection, projector: Projection) => {
        if (__isNullOrEmpty(data)) return [];

        var values =
            __reduce(data,
                (reduction, current) => {
                    var value = projector(current);
                    if (reduction.indexOf(value) === -1) reduction[reduction.length] = value;
                    return reduction; }, []);

        return values;
    };

    var __filterBy = (data: ICollection, predicate: Predicate) => {
        if (__isNullOrEmpty(data)) return [];

        var values =
            __reduce(
                data,
                (reduction, current) => {
                    if (predicate(current)) reduction[reduction.length] = current;
                    return reduction;
                }, []);

        return values;
    };

    var __firstBy = (data: ICollection, predicate: Predicate) => {
        if (__isNullOrEmpty(data)) return {};

        var enumerator = __createEnumerator(data);

        while (enumerator.MoveNext()) {
            var current = enumerator.Current();
            if (predicate(current)) return current;
        }

        return {};
    };

    var __lastBy = (data: ICollection, predicate: Predicate) => {
        if (__isNullOrEmpty(data)) return {};

        var last = null;
        __forEach(data, (item, _) => { if (predicate(item)) last = item; });

        return last;
    };

    var __slice = (data: ICollection, first: number, last: number) => {
        if (__isNullOrEmpty(data)) return [];

        return Array.prototype.slice.apply(data, [first, last]);
    };

    var __head = (data: ICollection) => {
        if (__isNullOrEmpty(data)) return {};

        return data[0];
    };

    var __tail = (data: ICollection) => {
        if (__isNullOrEmpty(data) || data.length < 2) return [];

        return __slice(data, 1, data.length);
    };

    var __containsBy = (data: ICollection, predicate: Predicate) => {
        if (__isNullOrEmpty(data)) return false;

        return __firstBy(data, predicate) !== null;
    };

    var __allBy = (data: ICollection, predicate: Predicate) => {
        if (__isNullOrEmpty(data)) return false;

        var enumerator = __createEnumerator(data);
        while (enumerator.MoveNext()) {
            if (!predicate(enumerator.Current())) return false;
        }

        return true;
    };

    var __anyBy = (data: ICollection, predicate: Predicate) => {
        if (__isNullOrEmpty(data)) return false;

        var enumerator = __createEnumerator(data);
        while (enumerator.MoveNext()) {
            if(predicate(enumerator.Current())) return true;
        }

        return false;
    };

    export class Enumerable {
        static init = (count, initializer) => new Enumerable(__init(count, initializer));
        static zero<T>(count, zeroVal?: T) {
            return new Enumerable(__zero(count, zeroVal));
        }
        
        private _data: ICollection;

        constructor(data: ICollection) {
            this._data = data;
        }

        get length() { return this._data.length; }

        forEach = (action: IteratorAction) => { __forEach(this._data, action); };
        map = projector => new Enumerable(__map(this._data, projector));
        reduce = (reducer, start) => __reduce(this._data, reducer, start);
        minBy = projector => __minBy(this._data, projector);
        maxBy = projector => __maxBy(this._data, projector);
        sumBy = projector => __sumBy(this._data, projector);
        averageBy = projector => __averageBy(this._data, projector);
        distinctBy = projector => new Enumerable(__distinctBy(this._data, projector));
        filterBy = predicate => new Enumerable(__filterBy(this._data, predicate));
        firstBy = predicate => __firstBy(this._data, predicate);
        lastBy = predicate => __lastBy(this._data, predicate);
        slice = (first, last) => new Enumerable(__slice(this._data, first, last));
        head = () => __head(this._data);
        tail = () => new Enumerable(__tail(this._data));
        containsBy = predicate => __containsBy(this._data, predicate);
        allBy = predicate => __allBy(this._data, predicate);
        anyBy = predicate => __anyBy(this._data, predicate);
    }
}
