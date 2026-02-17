import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Search, Shield, User } from "lucide-react";

interface User {
    id: number;
    email: string;
    name: string;
    phone?: string;
    role: "user" | "admin";
    created_at: string;
}

export function AdminUsers() {
    const { token } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("");

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter]);

    const fetchUsers = async () => {
        try {
            let url = "/api/admin/users?";
            if (search) url += `search=${encodeURIComponent(search)}&`;
            if (roleFilter) url += `role=${roleFilter}&`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (id: number, role: "user" | "admin") => {
        try {
            const response = await fetch(`/api/admin/users/${id}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) throw new Error("Failed to update user role");
            fetchUsers();
        } catch (error) {
            console.error("Error updating user role:", error);
            alert("Failed to update user role");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Users</h1>
                <p className="text-slate-500 mt-1">Manage user accounts and permissions</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="text-center py-12">Loading users...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${user.role === "admin"
                                                        ? "bg-blue-50 border-blue-100 text-blue-600"
                                                        : "bg-slate-50 border-slate-200 text-slate-500"
                                                        }`}>
                                                        {user.role === "admin" ? (
                                                            <Shield className="w-5 h-5" />
                                                        ) : (
                                                            <User className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div className="font-medium text-slate-900">{user.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                            <td className="px-6 py-4 text-slate-600">{user.phone || "-"}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => updateUserRole(user.id, e.target.value as "user" | "admin")}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 ring-1 ring-inset ${user.role === "admin"
                                                        ? "bg-blue-50 text-blue-700 ring-blue-200"
                                                        : "bg-slate-50 text-slate-700 ring-slate-200"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === "admin"
                                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
