export class User {
    constructor(
        public expiresIn: Date | number,
        public userName: string,
        public token: string,
    ) { }

    get _token() {
        if (!this.expiresIn || new Date() > this.expiresIn) {
            return null;
        }
        return this.token;
    }
}

