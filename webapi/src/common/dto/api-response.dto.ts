export class ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    requestId?: string;
    timestamp: string;

    constructor(success: boolean, data?: T, message?: string, requestId?: string) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.requestId = requestId;
        this.timestamp = new Date().toISOString();
    }

    static success<T>(data: T, message?: string, requestId?: string): ApiResponse<T> {
        return new ApiResponse(true, data, message, requestId);
    }

    static error(message: string, requestId?: string): ApiResponse<null> {
        return new ApiResponse(false, null, message, requestId);
    }
}
