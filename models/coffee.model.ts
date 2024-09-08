import mongoose, { Document, Model, Schema } from 'mongoose';

interface ICoffee extends Document {
  name: string;
  description: string;
  roasted: string;
  categories: string;
  imagelink_square: object;
  imagelink_portrait: object;
  ingredients: string;
  special_ingredient: string;
  prices: { size: string; price: number };
  average_rating: number;
  ratings_count: string;
  favorites: boolean;
  type: string;
}

const coffeeSchema = new Schema<ICoffee>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  roasted: {
    type: String,
    required: true,
  },
  categories: {
    type: String,
    required: true,
  },
  imagelink_square: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  imagelink_portrait: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  ingredients: {
    type: String,
    required: true,
  },
  special_ingredient: {
    type: String,
    required: true,
  },
  prices: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  average_rating: {
    type: Number,
    default: 0,
  },
  ratings_count: {
    type: String,
  },
  favorites: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
  },
});

const CoffeeModel: Model<ICoffee> = mongoose.model('coffee', coffeeSchema);

export default CoffeeModel;
