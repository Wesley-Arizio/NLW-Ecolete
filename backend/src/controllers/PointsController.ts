import knex from '../database/connection';
import { Request, Response } from 'express';


class PointsController{

    async index(req: Request, res:Response){
        const { city, uf, items } = req.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');


        return res.status(200).send({ points });
    }

    async show(req: Request, res: Response){
        const { id } = req.params;
        try{
            const point = await knex('points').where('id', id).first();
            
            if(!point) return res.status(400).send({ msg: "Point not found" });
            
            const items = await knex('items')
                .join('point_items', 'items.id', '=', 'point_items.item_id')
                .where('point_items.point_id', id)
                .select('items.title');            
            
                return res.status(200).send({ point, items });
        }catch(error){
            return res.status(400).send({ msg: "Error on loading a point" })
        }

    }

    async create(req: Request, res: Response){

        const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body;
        try{
            const point = { image: 'https://images.unsplash.com/photo-1557333610-90ee4a951ecf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
                name, email, whatsapp, latitude, longitude, city, uf}
            const trx = await knex.transaction();
    
            const inserted_id = await trx('points').insert(point);
            
            const point_id = inserted_id[0];
    
            const point_items = items.map((item_id: number) => {
                return{
                    item_id,
                    point_id
                };
            });
    
            await trx('point_items').insert(point_items);
            trx.commit();
    
            return res.json({
                id: point_id,
                ...point
            })
        }catch(error){
            return res.status(error).send({msg: "error on adding a new point"});
        }
    }
}
export default PointsController;