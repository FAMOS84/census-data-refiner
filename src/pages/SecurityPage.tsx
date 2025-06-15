
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, ArrowLeft, Lock, Eye, FileText, AlertTriangle } from 'lucide-react';

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Census Formatter
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
              <Shield className="h-10 w-10 text-primary" />
              Security & Best Practices
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn about the security measures and best practices implemented in the Census Data Formatter to protect your sensitive information.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Data Security
              </CardTitle>
              <CardDescription>
                How we protect your census data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Client-Side Processing</h4>
                <p className="text-sm text-muted-foreground">
                  All data processing happens entirely in your browser. Your census files never leave your device or get uploaded to any server.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">No Data Persistence</h4>
                <p className="text-sm text-muted-foreground">
                  Data is only stored temporarily in memory while processing. Refreshing the page or closing the browser completely clears all data.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Secure File Handling</h4>
                <p className="text-sm text-muted-foreground">
                  Files are processed using secure JavaScript APIs with input validation and sanitization to prevent malicious content.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Privacy Protection
              </CardTitle>
              <CardDescription>
                Your privacy is our priority
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">No Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  We don't use analytics, tracking pixels, or third-party scripts that could monitor your activity.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">No Account Required</h4>
                <p className="text-sm text-muted-foreground">
                  Use the application without creating accounts or providing personal information.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Minimal Data Access</h4>
                <p className="text-sm text-muted-foreground">
                  The application only accesses the specific data you choose to upload and process.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Transparency
              </CardTitle>
              <CardDescription>
                Open and transparent practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Source Code</h4>
                <p className="text-sm text-muted-foreground">
                  The application is built with modern web technologies (React, TypeScript) following security best practices.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Regular Security Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Dependencies are kept up-to-date with the latest security patches and updates.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Content Security Policy</h4>
                <p className="text-sm text-muted-foreground">
                  Implements CSP headers to prevent XSS attacks and unauthorized script execution.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Best Practices
              </CardTitle>
              <CardDescription>
                Recommended usage guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">File Security</h4>
                <p className="text-sm text-muted-foreground">
                  Only upload census files from trusted sources. Avoid files from unknown origins.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Browser Security</h4>
                <p className="text-sm text-muted-foreground">
                  Use an up-to-date browser with security features enabled for optimal protection.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Data Review</h4>
                <p className="text-sm text-muted-foreground">
                  Always review processed data before exporting to ensure accuracy and completeness.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Security Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              While we implement strong security measures, always exercise caution when handling sensitive data. 
              If you have specific security requirements or concerns, please consult with your IT security team 
              before using any web-based data processing tools.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Last updated: December 2024 | Questions about security? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
