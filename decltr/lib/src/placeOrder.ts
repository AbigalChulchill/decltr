import { Order } from "./types";

export const placeOrder = async (order: Order) => {
  console.log(order);
  return order;
};
