'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  History,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Gift,
  Wallet,
  Shield,
} from 'lucide-react'

// Mock transaction data
const transactions = [
  { id: '1', type: 'TRADE', amount: -500, currency: 'GC', status: 'COMPLETED', description: 'Bought YES on Bitcoin $100k', created_at: '2024-02-22T15:30:00' },
  { id: '2', type: 'SETTLEMENT', amount: 1200, currency: 'GC', status: 'COMPLETED', description: 'Won position on AI Turing Test', created_at: '2024-02-22T12:00:00' },
  { id: '3', type: 'DEPOSIT', amount: 10000, currency: 'GC', status: 'COMPLETED', description: 'Gold Coins deposit', created_at: '2024-02-21T18:45:00' },
  { id: '4', type: 'REFERRAL', amount: 20000, currency: 'GC', status: 'COMPLETED', description: 'Referral bonus - NewTrader1', created_at: '2024-02-21T10:00:00' },
  { id: '5', type: 'KYC_REWARD', amount: 20, currency: 'SC', status: 'COMPLETED', description: 'KYC verification bonus', created_at: '2024-02-20T14:30:00' },
  { id: '6', type: 'TRADE', amount: -300, currency: 'GC', status: 'COMPLETED', description: 'Bought NO on SpaceX Mars', created_at: '2024-02-20T11:20:00' },
  { id: '7', type: 'WITHDRAWAL', amount: -5000, currency: 'GC', status: 'COMPLETED', description: 'Withdrawal to wallet', created_at: '2024-02-19T09:00:00' },
  { id: '8', type: 'BET', amount: -200, currency: 'SC', status: 'COMPLETED', description: 'Sweeps bet on Sports outcome', created_at: '2024-02-18T20:00:00' },
  { id: '9', type: 'DEPOSIT', amount: 50, currency: 'SC', status: 'COMPLETED', description: 'Sweeps Coins promotional', created_at: '2024-02-17T12:00:00' },
  { id: '10', type: 'TRADE', amount: -1000, currency: 'GC', status: 'COMPLETED', description: 'Bought YES on Fed rate cut', created_at: '2024-02-16T16:30:00' },
]

const transactionTypes = ['All', 'TRADE', 'DEPOSIT', 'WITHDRAWAL', 'SETTLEMENT', 'REFERRAL', 'KYC_REWARD', 'BET']

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'TRADE':
    case 'BET':
      return ArrowRightLeft
    case 'DEPOSIT':
      return Wallet
    case 'WITHDRAWAL':
      return ArrowDownRight
    case 'SETTLEMENT':
      return ArrowUpRight
    case 'REFERRAL':
    case 'KYC_REWARD':
      return Gift
    default:
      return History
  }
}

const getTransactionColor = (type: string, amount: number) => {
  if (amount > 0) return 'text-profit bg-profit/10'
  return 'text-loss bg-loss/10'
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedType, setSelectedType] = React.useState('All')
  const [dateRange, setDateRange] = React.useState('all')

  const filteredTransactions = React.useMemo(() => {
    let txns = transactions

    if (selectedType !== 'All') {
      txns = txns.filter(t => t.type === selectedType)
    }

    if (searchQuery) {
      txns = txns.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return txns
  }, [searchQuery, selectedType])

  const exportHistory = () => {
    // Simulated export
    console.log('Exporting transaction history...')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">View all your transactions</p>
        </div>
        <Button variant="outline" onClick={exportHistory}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {transactionTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredTransactions.map((transaction) => {
              const IconComponent = getTransactionIcon(transaction.type)
              const colorClass = getTransactionColor(transaction.type, transaction.amount)

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(transaction.created_at)}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${transaction.amount > 0 ? 'text-profit' : 'text-loss'}`}>
                      {transaction.amount > 0 ? '+' : ''}
                      {formatCurrency(Math.abs(transaction.amount), transaction.currency as 'GC' | 'SC')}
                    </p>
                    <Badge
                      variant={transaction.status === 'COMPLETED' ? 'success' : transaction.status === 'PENDING' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  )
}