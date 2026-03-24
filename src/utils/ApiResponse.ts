export class ApiResponse {
    public readonly statusCode;
    public readonly message;
    public readonly data: any;
    public readonly success;

    constructor(statusCode: number, data: any, message: string) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = this.statusCode < 400;
    }
}
