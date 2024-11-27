import express from 'express';
import intentService from '../../services/intent/Intent.service.ts';
import type { Query } from '../mqtt/types.ts';

export class WebController {
    testIntent = (req: express.Request, res: express.Response) => {
        intentService
            .recognize(req.body as Query)
            .then(response => res.send(response))
            .catch(err => res.send(err));
    };
}
