import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log(API_BASE_URL);

interface User {
  _id: string;
  name: string;
  email: string;
  referrals: number;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/api/users/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  const users = await response.json();
  console.log("fetched users", users)
  return users;
};

const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
};
// console.log(deleteUser)

const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch users
  const {
    data: users,
    isLoading: isFetchingUsers,
    isError,
    error,
  } = useQuery<User[], Error>({ queryKey: ["users"], queryFn: fetchUsers });

//   console.log(data)

  // Mutation for deleting a user
  const mutation = useMutation({
    mutationFn: deleteUser, 
    onMutate: (id) => {
        console.log("mutating with id", id)
      setDeletingId(id); // Track which user is being deleted
    },
    onSuccess: () => {
      // Invalidate the query to refresh the user list
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingId(null); // Clear deleting state
    },
    onError: (error: Error) => {
      console.error("Error deleting user:", error.message);
      setDeletingId(null); // Clear deleting state even on error
    },
  });

//   console.log(mutation)
  const handleDelete = (id: string) => {
    mutation.mutate(id);
  };

  // Loading and error states
  if (isFetchingUsers) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Referrals</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user._id}>
              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.referrals || 0}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleDelete(user._id)}
                  className={`text-red-500 hover:underline ${
                    deletingId === user._id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={deletingId === user._id}
                >
                  {deletingId === user._id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
