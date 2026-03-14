import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private firebaseApp: admin.app.App;

    constructor(private configService: ConfigService) {
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        if (!projectId) {
            // We don't throw here to allow the app to start even without Firebase config,
            // but we should log or handle it when verifyIdToken is called.
            console.warn('FIREBASE_PROJECT_ID is not set. Google login will not work.');
            return;
        }

        this.firebaseApp = admin.initializeApp({
            projectId: projectId,
        }, 'cataur-backend');
    }

    async verifyIdToken(idToken: string) {
        if (!this.firebaseApp) {
            throw new InternalServerErrorException('Firebase is not configured');
        }

        try {
            const decodedToken = await this.firebaseApp.auth().verifyIdToken(idToken);
            if (!decodedToken.email) {
                throw new UnauthorizedException('Firebase ID token missing email');
            }
            return {
                email: decodedToken.email,
                name: decodedToken.name || decodedToken.email.split('@')[0],
                picture: decodedToken.picture,
                uid: decodedToken.uid,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('Invalid Firebase ID token');
        }
    }
}
