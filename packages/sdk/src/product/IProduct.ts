export interface IProduct<TData> {
  id: string
  name: string
  description?: string
  data: TData
}
