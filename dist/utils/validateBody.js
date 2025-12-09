"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateBody = async (schema, body) => {
    try {
        await schema.validate(body);
        return true;
    }
    catch (error) {
        if (error instanceof Error) {
            error.status = 400;
        }
        throw error;
    }
};
exports.default = validateBody;
