import { D1UpdateEndpoint } from 'chanfana';
import { z } from 'zod';
import { CommentSchema, UpdateCommentRequestSchema } from '../schemas/comment.js';

export class UpdateComment extends D1UpdateEndpoint {
  _meta = { 
    model: { 
      schema: CommentSchema, 
      primaryKeys: ['id'], 
      tableName: 'comments' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = UpdateCommentRequestSchema.parse(requestData);
    
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