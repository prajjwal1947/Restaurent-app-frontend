import { createContext, useContext } from "react";

export const BrandingContext = createContext({
  restaurant: null,
  refreshRestaurant: async () => null,
});

export function useRestaurantBranding() {
  return useContext(BrandingContext);
}