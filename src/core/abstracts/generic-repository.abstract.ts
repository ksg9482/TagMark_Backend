export abstract class GenericRepository<T> {
  abstract getAll(): Promise<T[]>;

  abstract get(id: number): Promise<T>;

  abstract create(item: Partial<T>): Promise<T>;

  abstract update(id: number, item: Partial<T>);

  abstract delete(id: number)
}
