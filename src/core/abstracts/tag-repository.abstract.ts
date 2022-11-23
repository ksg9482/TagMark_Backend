import { QueryRunner, SelectQueryBuilder } from "typeorm";
import { Tag } from "../entities";
import { GenericRepository } from "./generic-repository.abstract";

export abstract class TagRepository extends GenericRepository<Tag> {
    abstract create(item: Partial<Tag>): Promise<Tag> 
}