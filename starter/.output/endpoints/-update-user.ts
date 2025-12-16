import { D1UpdateEndpoint } from 'chanfana';
import { z } from 'zod';
import { UserSchema, UpdateUserRequestSchema } from '../schemas/user.js';

export class UpdateUser extends D1UpdateEndpoint {
  _meta = { 
    model: { 
      schema: UserSchema, 
      primaryKeys: ['id'], 
      tableName: 'users' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = UpdateUserRequestSchema.parse(requestData);
    
    // Add updated timestamp
    const finalData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    return super.handle({
      ...c,
      req: {
        ...c.req,
        json: () => Promise.resolve(finalData)
      }
    } as Context);
  }
}