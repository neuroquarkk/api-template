import type { Request, Response } from 'express';

/**
 * @template B - The type of the Request **Body** (defaults to `any`)
 * @template P - The type of the Route **Parameters** (defaults to `any`)
 */
export type TypedController<B = any, P = any> = (
    req: Request<P, any, B, any>,
    res: Response
) => Promise<any> | any;
