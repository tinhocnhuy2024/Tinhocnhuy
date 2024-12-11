import mongoose, { Schema, Document } from "mongoose";

interface News extends Document {
    id: string,
    title: string,
    slug: string,
    description: string,
    avatar: string,
    content: string,
    username: string,
    views: number,
    date:Date,
    typesid: string,
    tag: [string],
}

const newsSchema: Schema = new Schema<News>({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, },
    slug: { type: String, required: true, },
    description: { type: String, required: false },
    avatar: { type: String, required: true, },
    content: { type: String, required: true, },
    username: { type: String, required: true, },
    views: { type: Number, default: 0, },
    date:{type: Date, default: Date.now},
    typesid: { type: String, ref: 'Types_News', required: true },
    tag: { type: [String], ref: 'Tag', required: false },
}, { collection: 'News' })

const NewsModel = mongoose.model<News>('News', newsSchema);

export { News, NewsModel }