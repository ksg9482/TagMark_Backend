export interface IGenericRepository<T> {
  getAll: () => Promise<T[]>;

  get: (id: string) => Promise<T>;

  create: (item: Partial<T>) => Promise<T>;

  save: (item: Partial<T>) => Promise<T>;

  update: (id: string, item: Partial<T>) => Promise<any>;

  delete: (id: string) => Promise<any>;
}
