// "use client";

// import { createContext, useContext, ReactNode, useState, useEffect } from "react";
// import { User } from "../types";
// import { useAuth } from "../hooks/useAuth";


// interface UserContextType {
//   user: User | null;
//   setUser: (user: User | null) => void;
//   refreshUser: () => void;
//   location: string;
//   setLocation: (location: string) => void;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider = ({ children }: { children: ReactNode }) => {
//   const { user, setUser, refreshUser, isHydrated } = useAuth();

//   // Add a state to manage location
//   const [location, setLocation] = useState<string>("United States"); // Default location

//     // Update location once user data is loaded
//     useEffect(() => {
//       const storedUser = sessionStorage.getItem("user");
//       if (storedUser) {
//         try {
//           const parsedUser = JSON.parse(storedUser);
//           setUser(parsedUser);
//           setLocation(parsedUser.location || "United States"); // ✅ Use stored location or fallback
//         } catch (error) {
//           console.error("❌ Failed to parse stored user data:", error);
//         }
//       }
//     }, [setUser]);

//   // ⛔ Prevent rendering until hydration is complete
//   if (!isHydrated) return null;

//   return (
//     <UserContext.Provider value={{ user, setUser, refreshUser, location, setLocation }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// // ✅ Custom hook to use user data globally
// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within a UserProvider");
//   }
//   return context;
// };
