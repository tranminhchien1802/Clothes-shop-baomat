// UserAdapter – Adapter Pattern cho người dùng
// Chuyển đổi định dạng người dùng giữa frontend và API

class UserAdapter {
    static fromAPI(user) {
        if (!user) return null;
        return {
            id: user.id || user._id,
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'user'
        };
    }

    static toAPI(user) {
        if (!user) return null;
        return {
            name: user.name,
            email: user.email
        };
    }

    static fromAPIAll(users) {
        if (!Array.isArray(users)) return [];
        return users.map(u => UserAdapter.fromAPI(u));
    }

    static isAdmin(user) {
        return user && user.role === 'admin';
    }
}

export default UserAdapter;
