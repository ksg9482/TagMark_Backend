export interface IGenericRepository<Type> {
  getAll: () => Promise<Type[]>;

  get: (id: string) => Promise<Type | null>;

  update: (id: string, item: Partial<Type>) => Promise<any>;

  delete: (id: string) => Promise<any>;
}
