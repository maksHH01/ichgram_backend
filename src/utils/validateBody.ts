import { ZodType } from "zod"; 
import { IHttpError } from "../types/interfaces";

const validateBody = async (schema: ZodType, body: any): Promise<void> => {
  try {

    await schema.parseAsync(body);
  } catch (error) {
    if (error instanceof Error) {
      (error as IHttpError).status = 400;
    }
    throw error;
  }
};

export default validateBody;