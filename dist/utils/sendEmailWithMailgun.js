"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const form_data_1 = __importDefault(require("form-data"));
const mailgun_js_1 = __importDefault(require("mailgun.js"));
require("dotenv/config");
const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;
// Проверяем, что переменные окружения установлены
if (!MAILGUN_API_KEY)
    throw new Error("MAILGUN_API_KEY is not defined in .env");
if (!MAILGUN_DOMAIN)
    throw new Error("MAILGUN_DOMAIN is not defined in .env");
const mailgun = new mailgun_js_1.default(form_data_1.default);
const mg = mailgun.client({ username: "api", key: MAILGUN_API_KEY });
const sendEmailWithMailgun = async (data) => {
    const email = {
        ...data,
        from: `Excited User <mailgun@${MAILGUN_DOMAIN}>`,
    };
    return mg.messages.create(MAILGUN_DOMAIN, email);
};
exports.default = sendEmailWithMailgun;
