import { Params } from 'nestjs-pino';
import { IncomingMessage } from 'http';

export const loggerConfig: Params = {
    pinoHttp: {
        transport: {
            targets: [
                {
                    target: 'pino/file', // Output to console (stdout)
                    options: { destination: 1 },
                },
                {
                    target: 'pino-loki', // Output to Loki
                    options: {
                        batching: true,
                        interval: 5,
                        host: process.env.LOKI_HOST || 'http://loki:3100',
                        labels: { app: 'cataur-api' },
                        propsToLabels: ['context', 'userId', 'category'], // These fields will be indexed as Loki labels
                    },
                },
            ],
        },
        genReqId: (req: IncomingMessage) => {
            return req.headers['x-request-id'] || crypto.randomUUID();
        },
        redact: {
            paths: ['req.headers.authorization', 'req.body.password', 'req.body.token'],
            remove: true,
        },
        customProps: (req: IncomingMessage) => ({
            context: 'HTTP',
        }),
        serializers: {
            req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                headers: {
                    ...req.headers,
                    authorization: undefined,
                },
            }),
        },
    },
};
