// CartIterator – Iterator Pattern cho giỏ hàng
// Duyệt, lọc, tính tổng các item trong giỏ hàng

class CartIterator {
    constructor(items = []) {
        this.items = [...items];
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
        let result = [...this.items];
        this.filters.forEach(fn => { result = result.filter(fn); });
        if (this.sortFn) result.sort(this.sortFn);
        return result;
    }

    // Tính tổng tiền các item trong giỏ
    getTotal() {
        return this.collect().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Đếm tổng số lượng sản phẩm
    getTotalQuantity() {
        return this.collect().reduce((sum, item) => sum + item.quantity, 0);
    }

    // Lấy item có giá cao nhất
    getMostExpensive() {
        const items = this.collect();
        if (!items.length) return null;
        return items.reduce((max, item) => (item.price > max.price ? item : max), items[0]);
    }

    // Lấy item có số lượng nhiều nhất
    getMostQuantity() {
        const items = this.collect();
        if (!items.length) return null;
        return items.reduce((max, item) => (item.quantity > max.quantity ? item : max), items[0]);
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

export default CartIterator;
