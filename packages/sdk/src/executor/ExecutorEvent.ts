export type ExecutorEventType
  = | 'approval:preparing'
    | 'approval:signing'
    | 'approval:confirming'
    | 'approval:completed'
    | 'transfer:preparing'
    | 'transfer:confirming'
    | 'transfer:completed'
    | 'payment:preparing'
    | 'payment:sponsoring'
    | 'payment:signing'
    | 'payment:confirming'
    | 'payment:completed'
    | 'cancelled'
    | 'failed'

export type ExecutorEvent = {
  type: ExecutorEventType
  error?: unknown
}
