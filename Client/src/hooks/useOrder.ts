import { OrderContext } from "@/context/orderContext";
import { useContext } from "react";
export const useOrder= () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrder muse be used within a Provider")
    }
    return context
}