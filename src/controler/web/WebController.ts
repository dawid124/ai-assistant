import express from "express";

export class WebController {
    getHome = (req: express.Request, res: express.Response) => {
        res.send('Welcome to WebController!');
    }
}
