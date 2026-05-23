'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { formatCurrency } from '@/lib/utils'
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Bell,
  Lock,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'

// Mock user data
const mockUser = {
  id: 'user1',
  email: 'trader@example.com',
  username: 'TraderPro',
  phone: '+1 (555) 123-4567',
  avatar_url: null,
  gold_balance: 50000,
  sweeps_balance: 2500,
  kyc_status: 'pending' as const,
  created_at: '2024-01-15',
}

const kycLevels = [
  { level: 1, name: 'Basic', requirements: 'Email verified', verified: true },
  { level: 2, name: 'Standard', requirements: 'Phone verified', verified: true },
  { level: 3, name: 'Enhanced', requirements: 'Identity document', verified: mockUser.kyc_status === 'approved' },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = React.useState(false)
  const [username, setUsername] = React.useState(mockUser.username)
  const [phone, setPhone] = React.useState(mockUser.phone)
  const [notifications, setNotifications] = React.useState({
    email: true,
    push: true,
    trades: true,
    promotions: false,
  })

  const handleSaveProfile = () => {
    // Save profile logic
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                {mockUser.avatar_url ? (
                  <img
                    src={mockUser.avatar_url}
                    alt={username}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <User className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>

            {/* Form */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={mockUser.email}
                    disabled
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Member Since</label>
                <Input
                  value={new Date(mockUser.created_at).toLocaleDateString()}
                  disabled
                />
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Balances & KYC */}
        <div className="space-y-6">
          {/* Balances */}
          <Card>
            <CardHeader>
              <CardTitle>Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  <span className="font-medium">Gold Coins</span>
                </div>
                <span className="text-xl font-bold text-gold">
                  {mockUser.gold_balance.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  <span className="font-medium">Sweeps Coins</span>
                </div>
                <span className="text-xl font-bold text-sweeps">
                  {mockUser.sweeps_balance.toLocaleString()}
                </span>
              </div>
              <Button className="w-full" variant="outline">
                Add Funds
              </Button>
            </CardContent>
          </Card>

          {/* KYC Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                KYC Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={mockUser.kyc_status === 'approved' ? 'success' : mockUser.kyc_status === 'pending' ? 'secondary' : 'destructive'}>
                  {mockUser.kyc_status === 'approved' ? 'Verified' : mockUser.kyc_status === 'pending' ? 'Pending' : 'Not Verified'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {kycLevels.map((level) => (
                  <div key={level.level} className="flex items-center gap-3">
                    {level.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-profit" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{level.name}</p>
                      <p className="text-xs text-muted-foreground">{level.requirements}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full" asChild>
                <Link href="/kyc">
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Identity
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Button
                variant={notifications.email ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
              >
                {notifications.email ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive push alerts</p>
              </div>
              <Button
                variant={notifications.push ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
              >
                {notifications.push ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Trade Updates</p>
                <p className="text-sm text-muted-foreground">Notify on position changes</p>
              </div>
              <Button
                variant={notifications.trades ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, trades: !prev.trades }))}
              >
                {notifications.trades ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Promotions</p>
                <p className="text-sm text-muted-foreground">News and special offers</p>
              </div>
              <Button
                variant={notifications.promotions ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, promotions: !prev.promotions }))}
              >
                {notifications.promotions ? 'On' : 'Off'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Enable 2FA
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bell className="w-4 h-4 mr-2" />
              Active Sessions
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
            <div className="pt-4 border-t">
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Disclaimer />
    </div>
  )
}