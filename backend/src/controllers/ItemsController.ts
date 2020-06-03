import knex from '../database/connection';
import { Request, Response } from 'express';


class ItemsController{
    async index(req: Request, res: Response){
        const items = await knex('items').select('*');
    
        const serializedItems = items.map(item => { 
            return {
                    id: item.id,
                    title: item.title,
                    image_url: `http://localhost:3000/uploads/${item.image}`,
                }; 
        });
    
        return res.status(200).send({ serializedItems });
    }
    
}
export default ItemsController;