// Product – Model class (OOP)
// Đóng gói dữ liệu sản phẩm với các phương thức business

class Product {
    constructor(data = {}) {
        this._id = data._id || '';
        this.name = data.name || '';
        this.description = data.description || '';
        this.price = data.price || 0;
        this.image = Array.isArray(data.image) ? data.image : (data.image ? [data.image] : []);
        this.category = data.category || '';
        this.subCategory = data.subCategory || '';
        this.sizes = data.sizes || [];
        this.date = data.date || Date.now();
        this.bestseller = data.bestseller || false;
    }

    isBestseller() {
        return this.bestseller === true;
    }

    hasSize(size) {
        return this.sizes.includes(size);
    }

    getMainImage() {
        return this.image[0] || '';
    }

    getPriceFormatted(currency = '$') {
        return `${currency}${this.price}`;
    }

    belongsToCategory(category) {
        if (!category) return true;
        return this.category === category;
    }

    belongsToSubCategory(subCategory) {
        if (!subCategory) return true;
        return this.subCategory === subCategory;
    }

    matchesSearch(query) {
        if (!query) return true;
        return this.name.toLowerCase().includes(query.toLowerCase());
    }

    toJSON() {
        return {
            _id: this._id,
            name: this.name,
            description: this.description,
            price: this.price,
            image: this.image,
            category: this.category,
            subCategory: this.subCategory,
            sizes: this.sizes,
            date: this.date,
            bestseller: this.bestseller
        };
    }

    static fromJSON(data) {
        return new Product(data);
    }
}

export default Product;
