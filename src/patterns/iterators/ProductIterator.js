// ProductIterator – Iterator Pattern
// Duyệt qua danh sách sản phẩm với filter/sort chainable

class ProductIterator {
    constructor(products = []) {
        this.products = [...products];
        this.index = 0;
        this.filters = [];
        this.sortFn = null;
    }

    reset() {
        this.index = 0;
        return this;
    }

    where(predicate) {
        this.filters.push(predicate);
        return this;
    }

    orderBy(fn) {
        this.sortFn = fn;
        return this;
    }

    collect() {
        let result = [...this.products];
        this.filters.forEach(fn => { result = result.filter(fn); });
        if (this.sortFn) result.sort(this.sortFn);
        return result;
    }

    next() {
        const filtered = this.collect();
        if (this.index < filtered.length) {
            return { value: filtered[this.index++], done: false };
        }
        return { value: undefined, done: true };
    }

    hasNext() {
        return this.index < this.collect().length;
    }

    current() {
        const filtered = this.collect();
        return filtered[this.index] || null;
    }

    first() {
        const filtered = this.collect();
        return filtered[0] || null;
    }

    last() {
        const filtered = this.collect();
        return filtered[filtered.length - 1] || null;
    }

    count() {
        return this.collect().length;
    }

    [Symbol.iterator]() {
        const filtered = this.collect();
        let i = 0;
        return {
            next: () => {
                if (i < filtered.length) return { value: filtered[i++], done: false };
                return { value: undefined, done: true };
            }
        };
    }
}

export default ProductIterator;
