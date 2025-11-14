'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Send, Loader2, Eye, TestTube } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SendEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    senderAddress: 'admin@sylvantoken.org',
    recipientType: 'all',
    recipientEmails: '',
    subject: '',
    body: '',
  });

  const senderAddresses = [
    'admin@sylvantoken.org',
    'info@sylvantoken.org',
    'support@sylvantoken.org',
    'noreply@sylvantoken.org',
  ];

  const handleSendEmail = async () => {
    // Validation
    if (!formData.subject || !formData.body) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.recipientType === 'custom' && !formData.recipientEmails) {
      toast({
        title: 'Validation Error',
        description: 'Please enter recipient email addresses',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast({
        title: 'Email Sent Successfully',
        description: `Email sent to ${data.recipientCount} recipient(s)`,
      });

      // Reset form
      setFormData({
        ...formData,
        subject: '',
        body: '',
        recipientEmails: '',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Send Email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!formData.subject || !formData.body) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in subject and body first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/email/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderAddress: formData.senderAddress,
          subject: formData.subject,
          body: formData.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      toast({
        title: 'Test Email Sent',
        description: 'Check your inbox for the test email',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Send Test Email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Send Email
          </h1>
          <p className="text-muted-foreground mt-1">
            Send emails to users manually
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Email Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
              <CardDescription>
                Compose your email message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sender Address */}
              <div className="space-y-2">
                <Label htmlFor="senderAddress">From (Sender Address)</Label>
                <Select
                  value={formData.senderAddress}
                  onValueChange={(value) =>
                    setFormData({ ...formData, senderAddress: value })
                  }
                >
                  <SelectTrigger id="senderAddress">
                    <SelectValue placeholder="Select sender address" />
                  </SelectTrigger>
                  <SelectContent>
                    {senderAddresses.map((address) => (
                      <SelectItem key={address} value={address}>
                        {address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the email address to send from
                </p>
              </div>

              {/* Recipient Type */}
              <div className="space-y-2">
                <Label htmlFor="recipientType">To (Recipients)</Label>
                <Select
                  value={formData.recipientType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, recipientType: value })
                  }
                >
                  <SelectTrigger id="recipientType">
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users Only</SelectItem>
                    <SelectItem value="verified">Verified Users Only</SelectItem>
                    <SelectItem value="custom">Custom Email List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Email List */}
              {formData.recipientType === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="recipientEmails">Email Addresses</Label>
                  <Textarea
                    id="recipientEmails"
                    placeholder="Enter email addresses (comma-separated)&#10;example@email.com, another@email.com"
                    value={formData.recipientEmails}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientEmails: e.target.value })
                    }
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple emails with commas
                  </p>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  placeholder="Enter your email message here...&#10;&#10;You can use variables:&#10;{{username}} - User's username&#10;{{email}} - User's email"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Supports variables: {'{'}{'{'} username {'}'}{'}'}, {'{'}{'{'} email {'}'}{'}'} 
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSendEmail}
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={isLoading}
              variant="outline"
              size="lg"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Send Test
            </Button>
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              size="lg"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📧 Sender Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>admin@sylvantoken.org</strong>
                <p className="text-xs text-muted-foreground">
                  Official admin communications
                </p>
              </div>
              <div>
                <strong>info@sylvantoken.org</strong>
                <p className="text-xs text-muted-foreground">
                  General information and updates
                </p>
              </div>
              <div>
                <strong>support@sylvantoken.org</strong>
                <p className="text-xs text-muted-foreground">
                  Support and help desk
                </p>
              </div>
              <div>
                <strong>noreply@sylvantoken.org</strong>
                <p className="text-xs text-muted-foreground">
                  Automated notifications
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💡 Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use "Send Test" to preview the email in your inbox</p>
              <p>• Variables will be replaced with actual user data</p>
              <p>• All emails are logged for tracking</p>
              <p>• Large batches are sent in chunks automatically</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">⚠️ Important</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Double-check recipients before sending</p>
              <p>• Emails cannot be recalled once sent</p>
              <p>• Rate limits apply (100 emails/hour)</p>
              <p>• All actions are logged in audit trail</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              This is how your email will look to recipients
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">From:</div>
              <div className="text-sm">{formData.senderAddress}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">To:</div>
              <div className="text-sm capitalize">{formData.recipientType} Users</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Subject:</div>
              <div className="font-medium">{formData.subject || '(No subject)'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Message:</div>
              <div className="p-4 border rounded-lg bg-muted/50 whitespace-pre-wrap">
                {formData.body || '(No message)'}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Note: Variables like {'{'}{'{'} username {'}'}{'}'} will be replaced with actual user data
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
