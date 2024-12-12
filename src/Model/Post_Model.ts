import mongoose, { Schema, Document } from "mongoose";

interface Post extends Document {
    id: string,
    title: string,
    slug: string,
    description: string,
    avatar: string,
    content: string,
    username: string,
    views: number,
    date: Date,
    categoryId: string,
}
const postSchema: Schema = new Schema<Post>({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, },
    description: { type: String, required: true },
    avatar: { type: String, required: true },
    content: { type: String, required: true },
    username: { type: String, required: true },
    views: { type: Number, default: 0 },
    date:{type: Date, default: Date.now},
    categoryId: { type: String, ref: 'Category', required: true },
}, {
    collection: 'Post',
});

const PostModel = mongoose.model<Post>('Post', postSchema);

export { Post, PostModel }