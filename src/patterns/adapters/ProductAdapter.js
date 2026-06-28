// ProductAdapter – Adapter Pattern
// Chuyển đổi dữ liệu sản phẩm giữa FixedData, API, và Product model

class ProductAdapter {
    static fromFixedData(product) {
        if (!product) return null;
        return {
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            images: Array.isArray(product.image) ? product.image : [product.image],
            category: product.category,
            subCategory: product.subCategory,
            sizes: product.sizes || [],
            date: product.date,
            isBestseller: product.bestseller || false
        };
    }

    static fromAPI(product) {
        if (!product) return null;
        return {
            id: product._id || product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            images: product.images
                || (Array.isArray(product.image) ? product.image : (product.image ? [product.image] : [])),
            category: product.category,
            subCategory: product.subCategory || product.subcategory,
            sizes: product.sizes || [],
            date: product.date || Date.now(),
            isBestseller: product.bestseller || product.isBestseller || false
        };
    }

    static toFixedData(product) {
        if (!product) return null;
        return {
            _id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.images,
            category: product.category,
            subCategory: product.subCategory,
            sizes: product.sizes,
            date: product.date,
            bestseller: product.isBestseller
        };
    }

    static toAPI(product) {
        if (!product) return null;
        return {
            _id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.images,
            category: product.category,
            subCategory: product.subCategory,
            sizes: product.sizes,
            date: product.date,
            bestseller: product.isBestseller
        };
    }

    static adapt(product) {
        if (!product) return null;
        if (product.image && !product.images) return ProductAdapter.fromFixedData(product);
        return ProductAdapter.fromAPI(product);
    }

    static adaptAll(products) {
        if (!Array.isArray(products)) return [];
        return products.map(p => ProductAdapter.adapt(p));
    }
}

export default ProductAdapter;
