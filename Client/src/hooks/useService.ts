import { ServiceContext } from "@/context/serviceContext";
import { useContext } from "react";
export const useService= () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error("useService muse be used within a Provider")
    }
    return context
}