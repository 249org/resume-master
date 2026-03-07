'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Save,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  User,
  Terminal,
  Bell,
  Shield,
  CreditCard,
  Check,
} from '@/components/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import PageTitle from '@/components/page-title'
import { BillingBreadcrumb } from '@/components/billing-breadcrumb'

const notificationSettings = [
  { id: 'email_analysis', label: 'Resume Analysis Complete', description: 'Get notified when your AI analysis finishes', defaultChecked: true },
  { id: 'email_tips', label: 'Weekly Resume Tips', description: 'Receive weekly optimization suggestions', defaultChecked: true },
  { id: 'email_jobs', label: 'New Job Matches', description: 'Be alerted when new jobs match your resume', defaultChecked: false },
  { id: 'email_billing', label: 'Billing & Invoices', description: 'Receive billing receipts and renewal reminders', defaultChecked: true },
]

export default function SettingsPage() {
  const params = useParams()
  const userId = params.id as string
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const apiKey = 'sk_live_51MszxxxxxxxxxxxxxxxxxxXXXXXXXXXXX'

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <BillingBreadcrumb />
      <div className="flex items-start justify-between">
        <PageTitle
          title="Account Settings"
          subtitle="Manage your profile, developer API access, notification preferences and security settings."
        />
        <Button className="gap-2 shrink-0" size="sm">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5 text-xs">
            <User className="h-3 w-3" /> Profile
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5 text-xs">
            <Terminal className="h-3 w-3" /> API Access
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs">
            <Bell className="h-3 w-3" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs">
            <Shield className="h-3 w-3" /> Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 text-xs">
            <CreditCard className="h-3 w-3" /> Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-secondary text-xl">
                <User className="h-4 w-4" /> Personal Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-secondary text-xl bg-background">AC</AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs">
                    <Upload className="h-3 w-3" /> Change
                  </Button>
                  <p className="text-foreground text-center text-xs">
                    Allowed: JPG, PNG (Max 2MB)
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-foreground text-sm">Full Name</Label>
                      <Input id="fullName" defaultValue="Alex Chen" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="jobTitle" className="text-foreground text-sm">Job Title</Label>
                      <Input id="jobTitle" defaultValue="Senior Software Engineer" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-foreground text-sm">Email Address</Label>
                    <Input id="email" defaultValue="alex@example.com" type="email" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-foreground text-sm">Resume Data Source</Label>
                <p className="text-foreground text-xs">
                  Upload your base resume to pre-fill the AI analysis context
                </p>
                <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50">
                  <Upload className="text-foreground h-8 w-8" />
                  <p className="text-secondary mt-2 text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-foreground text-xs">PDF or DOCX (Max 5MB)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Access Tab */}
        <TabsContent value="api" className="mt-6 space-y-6">
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-secondary text-xl">
                <Terminal className="h-4 w-4" /> Developer Access
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-foreground text-sm">Project API Key</Label>
                  <Badge variant="outline" className="text-xs">Read/Write</Badge>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={showApiKey ? apiKey : '•'.repeat(40)}
                      readOnly
                      className="pr-10 font-mono text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 h-2 w-2 rounded-full" />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={copyApiKey}>
                    {copied ? <Check className="text-primary h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-foreground mt-2 text-xs">
                  Keep your API key secret. Never expose it in client-side code or public repos.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm font-semibold">Regenerate API Key</p>
                  <p className="text-foreground text-xs">This will invalidate your current key immediately</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-foreground text-sm">Webhook URL</Label>
                <p className="text-foreground text-xs">Receive real-time analysis results via webhook</p>
                <Input placeholder="https://your-app.com/webhook/resume-ai" />
              </div>

              <div className="space-y-1">
                <Label className="text-foreground text-sm">API Documentation</Label>
                <p className="text-foreground text-xs">
                  View the full reference at{' '}
                  <a href="#" className="text-primary underline">docs.resumeai.dev</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-secondary text-xl">
                <Bell className="h-4 w-4" /> Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              {notificationSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary text-sm font-semibold">{setting.label}</p>
                    <p className="text-foreground text-xs">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.defaultChecked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-secondary text-xl">
                <Shield className="h-4 w-4" /> Password & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="currentPass" className="text-foreground text-sm">Current Password</Label>
                  <Input id="currentPass" type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="newPass" className="text-foreground text-sm">New Password</Label>
                  <Input id="newPass" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPass" className="text-foreground text-sm">Confirm Password</Label>
                  <Input id="confirmPass" type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button size="sm">Update Password</Button>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm font-semibold">Two-Factor Authentication</p>
                  <p className="text-foreground text-xs">Add an extra layer of security to your account</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold text-destructive">Danger Zone</p>
                <p className="text-foreground mt-1 text-xs">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" size="sm" className="mt-3">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-secondary text-xl">
                <CreditCard className="h-4 w-4" /> Billing & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <p className="text-foreground text-sm">
                Manage your subscription, payment methods and billing history.
              </p>
              <Button className="mt-4 gap-2" asChild>
                <Link href={`/users/${userId}/settings/billing`}>
                  <CreditCard className="h-4 w-4" /> Go to Billing
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
