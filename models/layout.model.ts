import { Schema, model, Document } from 'mongoose';

export interface Category extends Document {
  title: string;
}

export interface BannerImage extends Document {
  public_id: string;
  url: string;
}

export interface CoffeeType extends Document {
  title: string;
}

interface Layout extends Document {
  type: string;
  categories: Category[];
  banner: {
    image: BannerImage;
    title: string;
    subTitle: string;
  };
  ctype: CoffeeType[];
}

const categorySchema = new Schema<Category>({
  title: { type: String },
});
const bannerImageSchema = new Schema<BannerImage>({
  public_id: { type: String },
  url: { type: String },
});
const coffeeTypeSchema = new Schema<CoffeeType>({
  title: { type: String },
});

const layoutSchema = new Schema<Layout>({
  type: { type: String },
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: { type: String },
    subTitle: { type: String },
  },
  ctype: [coffeeTypeSchema],
});

const LayoutModel = model<Layout>('Layout', layoutSchema);

export default LayoutModel;
