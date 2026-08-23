export interface IMandateMethod {
  id: string
  isActive: boolean
}

export interface IMandate {
  name: string
  methods: IMandateMethod[]
}
