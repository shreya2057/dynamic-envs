// "use client";

// import { useState, useEffect } from "react";
// import {
//   updateEnvVars,
//   replaceEnvVars,
//   deleteEnvVars,
//   getCurrentEnvVars,
// } from "@/utils/updateEnv";

// interface EnvVar {
//   key: string;
//   value: string;
// }

// export default function EnvAdmin() {
//   const [envVars, setEnvVars] = useState<EnvVar[]>([]);
//   const [newKey, setNewKey] = useState("");
//   const [newValue, setNewValue] = useState("");
//   const [message, setMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   // Load current environment variables on component mount
//   useEffect(() => {
//     loadEnvVars();
//   }, []);

//   const loadEnvVars = async () => {
//     setIsLoading(true);
//     try {
//       const currentEnv = await getCurrentEnvVars();
//       if (currentEnv) {
//         const envArray = Object.entries(currentEnv).map(([key, value]) => ({
//           key,
//           value,
//         }));
//         setEnvVars(envArray);
//       }
//     } catch (error) {
//       setMessage("Error loading environment variables");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddEnvVar = async () => {
//     if (!newKey.trim() || !newValue.trim()) {
//       setMessage("Both key and value are required");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const result = await updateEnvVars({ [newKey]: newValue });
//       if (result.success) {
//         setMessage("Environment variable added successfully");
//         setNewKey("");
//         setNewValue("");
//         await loadEnvVars(); // Reload to show updated values
//       } else {
//         setMessage(result.error || "Failed to add environment variable");
//       }
//     } catch (error) {
//       setMessage("Error adding environment variable");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateEnvVar = async (key: string, value: string) => {
//     setIsLoading(true);
//     try {
//       const result = await updateEnvVars({ [key]: value });
//       if (result.success) {
//         setMessage(`Updated ${key} successfully`);
//         await loadEnvVars();
//       } else {
//         setMessage(result.error || "Failed to update environment variable");
//       }
//     } catch (error) {
//       setMessage("Error updating environment variable");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteEnvVar = async (key: string) => {
//     if (!confirm(`Are you sure you want to delete ${key}?`)) {
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const result = await deleteEnvVars([key]);
//       if (result.success) {
//         setMessage(`Deleted ${key} successfully`);
//         await loadEnvVars();
//       } else {
//         setMessage(result.error || "Failed to delete environment variable");
//       }
//     } catch (error) {
//       setMessage("Error deleting environment variable");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSaveAll = async () => {
//     setIsLoading(true);
//     try {
//       const envObject = envVars.reduce((acc, { key, value }) => {
//         acc[key] = value;
//         return acc;
//       }, {} as Record<string, string>);

//       const result = await replaceEnvVars(envObject);
//       if (result.success) {
//         setMessage("All environment variables saved successfully");
//       } else {
//         setMessage(result.error || "Failed to save environment variables");
//       }
//     } catch (error) {
//       setMessage("Error saving environment variables");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-6">
//             Environment Variables Management
//           </h1>

//           {/* Status Message */}
//           {message && (
//             <div
//               className={`mb-4 p-3 rounded-md ${
//                 message.includes("Error") || message.includes("Failed")
//                   ? "bg-red-100 text-red-700 border border-red-300"
//                   : "bg-green-100 text-green-700 border border-green-300"
//               }`}
//             >
//               {message}
//             </div>
//           )}

//           {/* Add New Environment Variable */}
//           <div className="mb-8 p-4 border border-gray-200 rounded-md bg-gray-50">
//             <h2 className="text-lg font-semibold text-gray-800 mb-3">
//               Add New Environment Variable
//             </h2>
//             <div className="flex gap-3 mb-3">
//               <input
//                 type="text"
//                 placeholder="Key (e.g., NEXT_PUBLIC_API_URL)"
//                 value={newKey}
//                 onChange={(e) => setNewKey(e.target.value)}
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <input
//                 type="text"
//                 placeholder="Value"
//                 value={newValue}
//                 onChange={(e) => setNewValue(e.target.value)}
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button
//                 onClick={handleAddEnvVar}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? "Adding..." : "Add"}
//               </button>
//             </div>
//           </div>

//           {/* Current Environment Variables */}
//           <div className="mb-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold text-gray-800">
//                 Current Environment Variables
//               </h2>
//               <div className="flex gap-2">
//                 <button
//                   onClick={loadEnvVars}
//                   disabled={isLoading}
//                   className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
//                 >
//                   Refresh
//                 </button>
//                 <button
//                   onClick={handleSaveAll}
//                   disabled={isLoading}
//                   className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
//                 >
//                   Save All
//                 </button>
//               </div>
//             </div>

//             {isLoading ? (
//               <div className="text-center py-8 text-gray-500">Loading...</div>
//             ) : envVars.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 No environment variables found
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {envVars.map((envVar, index) => (
//                   <div
//                     key={index}
//                     className="flex gap-3 items-center p-3 border border-gray-200 rounded-md"
//                   >
//                     <input
//                       type="text"
//                       value={envVar.key}
//                       onChange={(e) => {
//                         const updated = [...envVars];
//                         updated[index].key = e.target.value;
//                         setEnvVars(updated);
//                       }}
//                       className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       placeholder="Key"
//                     />
//                     <input
//                       type="text"
//                       value={envVar.value}
//                       onChange={(e) => {
//                         const updated = [...envVars];
//                         updated[index].value = e.target.value;
//                         setEnvVars(updated);
//                       }}
//                       className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       placeholder="Value"
//                     />
//                     <button
//                       onClick={() =>
//                         handleUpdateEnvVar(envVar.key, envVar.value)
//                       }
//                       disabled={isLoading}
//                       className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
//                     >
//                       Update
//                     </button>
//                     <button
//                       onClick={() => handleDeleteEnvVar(envVar.key)}
//                       disabled={isLoading}
//                       className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Instructions */}
//           <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
//             <h3 className="text-md font-semibold text-blue-800 mb-2">
//               Usage Instructions:
//             </h3>
//             <ul className="text-sm text-blue-700 space-y-1">
//               <li>• Add new environment variables using the form above</li>
//               <li>• Edit existing variables directly in the table</li>
//               <li>• Click "Update" to save individual changes</li>
//               <li>• Click "Save All" to save all changes at once</li>
//               <li>• Changes take effect immediately for new requests</li>
//               <li>
//                 • Use "Refresh" to reload the current values from the server
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

const Page = () => {
  return <div>Env Admin</div>;
};

export default Page;
