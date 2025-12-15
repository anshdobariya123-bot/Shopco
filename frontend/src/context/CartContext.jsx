import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  useCallback,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "cartItems";

/* ================= SAFE STORAGE ================= */
const getInitialCart = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Invalid cart data in localStorage", error);
    return [];
  }
};

/* ================= REDUCER ================= */
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const item = action.payload;

      const exist = state.cartItems.find(
        (x) => x.product === item.product
      );

      if (exist) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x.product === item.product
              ? { ...x, qty: item.qty ?? x.qty + 1 }
              : x
          ),
        };
      }

      return {
        ...state,
        cartItems: [...state.cartItems, { ...item, qty: item.qty ?? 1 }],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (x) => x.product !== action.payload
        ),
      };

    case "CLEAR_CART":
      return { cartItems: [] };

    default:
      return state;
  }
};

/* ================= PROVIDER ================= */
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: getInitialCart(),
  });

  /* PERSIST TO STORAGE */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state.cartItems)
    );
  }, [state.cartItems]);

  /* DERIVED STATE */
  const cartCount = useMemo(
    () =>
      state.cartItems.reduce(
        (acc, item) => acc + (item.qty || 1),
        0
      ),
    [state.cartItems]
  );

  /* ACTIONS */
  const addToCart = useCallback(
    (item) => dispatch({ type: "ADD_ITEM", payload: item }),
    []
  );

  const removeFromCart = useCallback(
    (id) => dispatch({ type: "REMOVE_ITEM", payload: id }),
    []
  );

  const clearCart = useCallback(
    () => dispatch({ type: "CLEAR_CART" }),
    []
  );

  /* MEMOIZED CONTEXT VALUE */
  const value = useMemo(
    () => ({
      cartItems: state.cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      clearCart,
    }),
    [state.cartItems, cartCount, addToCart, removeFromCart, clearCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

/* ================= HOOK ================= */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

