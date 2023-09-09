export interface IGenericRepository<Type> {
  getAll: () => Promise<Type[]>;

  get: (id: string) => Promise<Type | null>;

  save: (item: Omit<Type, 'id'>) => Promise<any>;

  update: (id: string, item: Partial<Type>) => Promise<any>;

  delete: (id: string) => Promise<any>;
}
