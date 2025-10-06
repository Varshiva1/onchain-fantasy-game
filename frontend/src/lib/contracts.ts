import factory from '../abi/MarketFactory.json'
import market from '../abi/Market.json'

export const FACTORY_ADDRESS = ((import.meta as any).env.VITE_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`
export const FactoryAbi = (factory as any).abi
export const MarketAbi = (market as any).abi

