import { Inject } from "@nestjs/common";
import { User } from "src/core";
import { Repository } from "typeorm";

export abstract class CustomRepository<T> {
    
    abstract getAll(): Promise<T[]>
}