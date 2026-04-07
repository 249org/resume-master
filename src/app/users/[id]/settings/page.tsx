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

const notificationSettings = [
  {
    id: 'email_analysis',
    label: 'Resume Analysis Complete',
    description: 'Get notified when your AI analysis finishes',
    defaultChecked: true,
  },
  {
    id: 'email_tips',
    label: 'Weekly Resume Tips',
    description: 'Receive weekly optimization suggestions',
    defaultChecked: true,
  },
  {
    id: 'email_jobs',
    label: 'New Job Matches',
    description: 'Be alerted when new jobs match your resume',
    defaultChecked: false,
  },
  {
    id: 'email_billing',
    label: 'Billing & Invoices',
    description: 'Receive billing receipts and renewal reminders',
    defaultChecked: true,
  },
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
      <div className="flex items-start justify-between">
        <PageTitle
          title="Account Settings"
          subtitle="Manage your profile, developer API access, notification preferences and security settings."
        />
        <Button className="shrink-0 gap-2" size="sm">
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
              <CardTitle className="text-secondary flex items-center gap-2 text-xl">
                <User className="h-4 w-4" /> Personal Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-0">
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-secondary bg-background text-xl">
                      AC
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary gap-1 text-xs"
                  >
                    <Upload className="h-3 w-3" /> Change
                  </Button>
                  <p className="text-foreground text-center text-xs">
                    Allowed: JPG, PNG (Max 2MB)
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor="fullName"
                        className="text-foreground text-sm"
                      >
                        Full Name
                      </Label>
                      <Input id="fullName" defaultValue="Alex Chen" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="jobTitle"
                        className="text-foreground text-sm"
                      >
                        Job Title
                      </Label>
                      <Input
                        id="jobTitle"
                        defaultValue="Senior Software Engineer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-foreground text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      defaultValue="alex@example.com"
                      type="email"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-foreground text-sm">
                  Resume Data Source
                </Label>
                <p className="text-foreground text-xs">
                  Upload your base resume to pre-fill the AI analysis context
                </p>
                <div className="hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors">
                  <Upload className="text-foreground h-8 w-8" />
                  <p className="text-secondary mt-2 text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-foreground text-xs">
                    PDF or DOCX (Max 5MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Access Tab */}
        <TabsContent value="api" className="mt-6 space-y-6">
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-secondary flex items-center gap-2 text-xl">
                <Terminal className="h-4 w-4" /> Developer Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-0">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-foreground text-sm">
                    Project API Key
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    Read/Write
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={showApiKey ? apiKey : '•'.repeat(40)}
                      readOnly
                      className="pr-10 font-mono text-sm"
                    />
                    <span className="absolute top-1/2 right-3 h-2 w-2 -translate-y-1/2 rounded-full bg-green-500" />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={copyApiKey}>
                    {copied ? (
                      <Check className="text-primary h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-foreground mt-2 text-xs">
                  Keep your API key secret. Never expose it in client-side code
                  or public repos.
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm font-semibold">
                    Regenerate API Key
                  </p>
                  <p className="text-foreground text-xs">
                    This will invalidate your current key immediately
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-foreground text-sm">Webhook URL</Label>
                <p className="text-foreground text-xs">
                  Receive real-time analysis results via webhook
                </p>
                <Input placeholder="https://your-app.com/webhook/resume-ai" />
              </div>

              <div className="space-y-1">
                <Label className="text-foreground text-sm">
                  API Documentation
                </Label>
                <p className="text-foreground text-xs">
                  View the full reference at{' '}
                  <a href="#" className="text-primary underline">
                    docs.resumeai.dev
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-secondary flex items-center gap-2 text-xl">
                <Bell className="h-4 w-4" /> Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              {notificationSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-secondary text-sm font-semibold">
                      {setting.label}
                    </p>
                    <p className="text-foreground text-xs">
                      {setting.description}
                    </p>
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
              <CardTitle className="text-secondary flex items-center gap-2 text-xl">
                <Shield className="h-4 w-4" /> Account security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <p className="text-foreground text-sm leading-relaxed">
                You sign in with Google or GitHub. Password changes and email
                login are not available for this account — manage access from
                your provider’s security settings.
              </p>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm font-semibold">
                    Two-Factor Authentication
                  </p>
                  <p className="text-foreground text-xs">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div>
                <p className="text-destructive text-sm font-semibold">
                  Danger Zone
                </p>
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
              <CardTitle className="text-secondary flex items-center gap-2 text-xl">
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
