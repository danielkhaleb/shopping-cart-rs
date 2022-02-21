import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
  }, [cart])

  const addProduct = async (productId: number) => {
    try {
      if (productId) {
        const resultStock = await api.get<Stock>(`/stock/${productId}`);
        if (resultStock && resultStock.data) {
          const stockItem = resultStock.data;
          let productOnStock = false;
          let isNewProductOnCart = false;
          cart.forEach(p => {
            if (p.id === stockItem.id) {
              if (p.amount <= stockItem.amount) {
                productOnStock = true
              }
            } else {
              isNewProductOnCart = true;
            }
          });
          if (isNewProductOnCart) {
            const resultProduct = await api.get<Product>(`/stock/${productId}`);
            if (resultProduct && resultProduct.data) {
              const newProduct = resultProduct.data;
              setCart([...cart, newProduct]);
              return;
            }
          }
          if (productOnStock) {
            const cartUpdated = cart.map(p => {
              if (p.id === productId) {
                p.amount++;
              }
              return p;
            });
            setCart([...cartUpdated]);
          } else {
            toast.error('Não a produto no stock!');
          }
        }
        toast.error('Produto não encontrado!');
      }
    } catch {
      toast.error('Algum erro inesperado aconteceu, por favor tente mais tarde');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
