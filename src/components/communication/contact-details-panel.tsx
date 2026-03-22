"use client";

import Link from "next/link";
import { Lock, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactInfo {
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  custodian_name?: string | null;
  custodian_mobile?: string | null;
}

interface ContactDetailsPanelProps {
  isPremium: boolean;
  contactInfo: ContactInfo | null;
}

export function ContactDetailsPanel({ isPremium, contactInfo }: ContactDetailsPanelProps) {
  if (!isPremium) {
    return (
      <div className="relative border rounded-lg p-6 text-center bg-muted/30">
        <div className="absolute inset-0 backdrop-blur-sm rounded-lg" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Upgrade to view contact details
          </p>
          <Link href="/membership-plans">
            <Button size="sm">View Plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!contactInfo) {
    return (
      <div className="border rounded-lg p-4 text-sm text-muted-foreground">
        Contact details not available.
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold">Contact Details</h4>

      {contactInfo.mobile_number && (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{contactInfo.mobile_number}</span>
        </div>
      )}

      {contactInfo.whatsapp_number && (
        <div className="flex items-center gap-2 text-sm">
          <MessageCircle className="h-4 w-4 text-green-600" />
          <span>{contactInfo.whatsapp_number}</span>
        </div>
      )}

      {contactInfo.email && (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{contactInfo.email}</span>
        </div>
      )}

      {contactInfo.custodian_name && (
        <div className="text-sm mt-2 pt-2 border-t">
          <p className="text-muted-foreground text-xs mb-1">Custodian</p>
          <p>{contactInfo.custodian_name}</p>
          {contactInfo.custodian_mobile && (
            <p className="text-muted-foreground">{contactInfo.custodian_mobile}</p>
          )}
        </div>
      )}
    </div>
  );
}
