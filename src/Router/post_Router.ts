import express from "express";
import { Post } from "../Controller/Post";
import { middleware } from "../middleware/jwt"
import { midlleware_file } from "../middleware/file";

const post_Router = express();

post_Router.get('/createPost', Post.post);

post_Router.post('/createPost', middleware, midlleware_file, Post.createPost);

post_Router.post('/updatePost/:id', middleware, midlleware_file, Post.updatePost);

post_Router.post('/deletePost/:id', middleware, Post.deletePost);

post_Router.get('/loadPost', Post.loadPost_Username);

post_Router.get('/AllPost', Post.loadAllPost);

post_Router.get('/loadPostCategories/:id', Post.loadPost_Categories);

post_Router.get('/bv/:slug', Post.loadPost);

post_Router.get('/post/:id', Post.loadPostId);

post_Router.get('/loadPost_top4_Dichvu', Post.top4_LoadPost_Dichvu)

post_Router.get('/loadPost_top4_Giaiphap', Post.top4_LoadPost_Giaiphap)

post_Router.get('/post/:id', Post.loadViews);

post_Router.get('/count/:id', Post.countViews);

post_Router.get('/allslugpost', Post.AllSlugPost);

post_Router.get('/allslugpost_news', Post.AllSlugPost_News)

//upload hình ảnh lên cloudinary , sử dụng cho Bài viết
post_Router.post('/uploadimagesPost', midlleware_file, Post.uploadImagesPost);

export default post_Router;