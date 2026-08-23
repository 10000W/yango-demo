export type ExecutorEventType
  = | 'approval:preparing'
    | 'approval:signing'
    | 'approval:confirming'
    | 'approval:completed'
    | 'approval:failed'
    | 'transfer:preparing'
    | 'transfer:confirming'
    | 'transfer:completed'
    | 'transfer:failed'
    | 'payment:preparing'
    | 'payment:sponsoring'
    | 'payment:signing'
    | 'payment:confirming'
    | 'payment:completed'
    | 'payment:failed'

export type ExecutorEvent = {
  type: ExecutorEventType
  error?: unknown
}
