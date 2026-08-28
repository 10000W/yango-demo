export type MandateSetup = {
  mandateId?: string
  payzapUrl?: string
  skipSetup?: boolean
  onClose?: () => void
}

export type MandateConfig = MandateSetup & { flow: 'mandate', mandateId: string }
