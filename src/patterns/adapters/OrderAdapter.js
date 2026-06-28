// OrderAdapter – Adapter Pattern cho đơn hàng
// Chuyển đổi định dạng đơn hàng giữa frontend và API

class OrderAdapter {
    // Từ API response -> frontend format
    static fromAPI(order) {
        if (!order) return null;
        return {
            id: order.id || order._id,
            userId: order.userId,
            userName: order.userName || '',
            items: (order.items || []).map(item => ({
                productId: item.productId || item._id,
                name: item.name,
                price: item.price,
                image: item.image || '',
                size: item.size,
                quantity: item.quantity
            })),
            totalAmount: order.totalAmount || 0,
            shippingAddress: order.shippingAddress || {},
            paymentMethod: order.paymentMethod || 'COD',
            status: order.status || 'pending',
            createdAt: order.createdAt || new Date().toISOString()
        };
    }

    // Từ frontend -> API body
    static toAPI(order) {
        if (!order) return null;
        return {
            userId: order.userId,
            items: order.items,
            totalAmount: order.totalAmount,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod
        };
    }

    // Chuyển đổi mảng
    static fromAPIAll(orders) {
        if (!Array.isArray(orders)) return [];
        return orders.map(o => OrderAdapter.fromAPI(o));
    }
}

export default OrderAdapter;
