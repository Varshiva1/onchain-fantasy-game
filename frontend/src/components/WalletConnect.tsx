import { useState, useEffect } from 'react'

interface WalletConnectProps {
  onAddressChange?: (address: string) => void
}

export function WalletConnect({ onAddressChange }: WalletConnectProps) {
  const [address, setAddress] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress')
    if (savedAddress) {
      setAddress(savedAddress)
      onAddressChange?.(savedAddress)
    }
  }, [onAddressChange])

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      if (window.ethereum && typeof window.ethereum.request === 'function') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })

        if (accounts && accounts.length > 0) {
          const userAddress = accounts[0]
          setAddress(userAddress)
          localStorage.setItem('walletAddress', userAddress)
          onAddressChange?.(userAddress)
        }
      } else {
        alert('MetaMask is not installed. Please install MetaMask to continue.')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress('')
    localStorage.removeItem('walletAddress')
    onAddressChange?.('')
  }

  return (
    <div className="flex items-center">
      {address ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 font-medium">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  )
}
