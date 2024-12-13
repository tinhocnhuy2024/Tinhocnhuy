import express from "express";
import { News } from "../Controller/News";
import { middleware } from "../middleware/jwt"
import { midlleware_file } from "../middleware/file";

const news_Router = express();

news_Router.get('/createNews', News.get_CreateNews)

news_Router.post('/createNews', middleware, midlleware_file, News.post_CreateNews)

news_Router.post('/updateNews/:id', middleware, midlleware_file, News.updateNews)

news_Router.post('/deleteNews/:id', middleware, News.deleteNews)

news_Router.get('/News/:slug', News.loadNews)

news_Router.get('/Newsid/:id', News.loadNewsId)

news_Router.get('/AllNews', News.loadAllNews)

news_Router.get('/randomNews', News.loadRandomNews)

news_Router.get('/top5viewstoday', News.LoadNews_Top5_ViewstoDay)

news_Router.get('/top5views', News.Top5Views)

news_Router.get('/top5latestnews', News.top5LatestNews)

news_Router.get('/typesNews/:id', News.loadNews_Types)//

news_Router.get('/tag/:id', News.LoadNews_Tag)

news_Router.get('/viewsNews/:id', News.loadViews)

news_Router.get('/countviewsNews/:id', News.countViews)

news_Router.get('/allslugnews', News.AllSlugNews)

news_Router.get('/testslug', News.Testslug)

news_Router.post('/uploadimagesNews', midlleware_file, News.uploadImagesNews)

export default news_Router;