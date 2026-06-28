// CartItem – Model class (OOP)
// Đóng gói dữ liệu item trong giỏ hàng với các phương thức tính toán

class CartItem {
    constructor(data = {}) {
        this.productId = data.productId || '';
        this.name = data.name || '';
        this.price = data.price || 0;
        this.image = data.image || '';
        this.size = data.size || '';
        this.quantity = data.quantity || 1;
    }

    getSubtotal() {
        return this.price * this.quantity;
    }

    getSubtotalFormatted(currency = '$') {
        return `${currency}${this.getSubtotal()}`;
    }

    incrementQuantity(amount = 1) {
        this.quantity += amount;
        return this;
    }

    setQuantity(qty) {
        this.quantity = Math.max(1, qty);
        return this;
    }

    matchesProduct(productId) {
        return this.productId === productId;
    }

    matchesSize(size) {
        return this.size === size;
    }

    toJSON() {
        return {
            productId: this.productId,
            name: this.name,
            price: this.price,
            image: this.image,
            size: this.size,
            quantity: this.quantity
        };
    }

    static fromJSON(data) {
        return new CartItem(data);
    }
}

export default CartItem;
