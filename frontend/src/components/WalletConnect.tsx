import { useState, useEffect } from 'react'

interface WalletConnectProps {
  onAddressChange?: (address: string) => void
}

export function WalletConnect({ onAddressChange }: WalletConnectProps) {
  const [address, setAddress] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected
    const savedAddress = localStorage.getItem('walletAddress')
    if (savedAddress) {
      setAddress(savedAddress)
      onAddressChange?.(savedAddress)
    }
  }, [onAddressChange])

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      // Check if MetaMask (or any wallet) is available
      if (window.ethereum && typeof window.ethereum.request === 'function') {
        // Request account access
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
    <div className="flex items-center gap-2">
      {address ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  )
}
