// OrderIterator – Iterator Pattern cho đơn hàng
// Duyệt, lọc, thống kê danh sách đơn hàng

class OrderIterator {
    constructor(orders = []) {
        this.orders = [...orders];
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
        let result = [...this.orders];
        this.filters.forEach(fn => { result = result.filter(fn); });
        if (this.sortFn) result.sort(this.sortFn);
        return result;
    }

    // Tính tổng doanh thu các đơn
    getTotalRevenue() {
        return this.collect().reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    }

    // Đếm số đơn theo trạng thái
    countByStatus() {
        const orders = this.collect();
        const stats = {};
        orders.forEach(order => {
            const status = order.status || 'unknown';
            stats[status] = (stats[status] || 0) + 1;
        });
        return stats;
    }

    // Lấy đơn hàng gần đây nhất
    getLatest() {
        const sorted = [...this.collect()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return sorted[0] || null;
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

export default OrderIterator;
