import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        id: String,
        name: String,
        price: Number,
        imageUrl: String,
        quantity: Number,
        size: String,
        color: String,
      },
    ],
    total: Number,
    shippingInfo: {
      name: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;