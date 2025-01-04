import { ForbiddenException, Injectable, InternalServerErrorException, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as firebase from 'firebase-admin';

@Injectable()
export class PreauthMiddleware implements NestMiddleware {
    private defaultApp: firebase.app.App;

    constructor() {

        const firebaseParams: firebase.ServiceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
        }

        this.defaultApp = firebase.initializeApp({
            credential: firebase.credential.cert(firebaseParams),
            databaseURL: 'https://spirit-island-community.firebaseio.com',
        });
    }

    async use(req: Request, res: Response, next: Function) {
        const token: string = req.headers.authorization;
        if (token != null && token != '') {
            const decodedToken = await this.defaultApp.auth().verifyIdToken(token.replace('Bearer ', ''))
            const user = {
                email: decodedToken.email,
            }
            req['user'] = user;
            next();
        }
        throw new ForbiddenException();
    }
}