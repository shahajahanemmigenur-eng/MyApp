'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { currentUser } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AccountType = 'personal' | 'private' | 'professional' | 'brand';

const accountTypeDescriptions: Record<AccountType, string> = {
  personal: 'Standard public account.',
  private: 'Approved followers only.',
  professional: 'Creator and business tools.',
  brand: 'Fully professional account for increasing brand value and marketing place and advertising the brand.',
};

const accountTypeLabels: Record<AccountType, string> = {
  personal: 'Personal',
  private: 'Private',
  professional: 'Professional',
  brand: 'Company Brand',
};

export default function AccountTypePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<AccountType>(currentUser.accountType);

  const handleSaveChanges = () => {
    // In a real app, you would save this to the backend.
    currentUser.accountType = selectedType;
    toast({
      title: 'Account Updated',
      description: `Switched to ${accountTypeLabels[selectedType]}.`,
    });
    router.back();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center p-2 border-b bg-card z-10 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-sm ml-1 uppercase tracking-tight">Account Type</h1>
      </header>
      <main className="flex-1 overflow-y-auto no-scrollbar p-5">
        <div className="mb-6 space-y-1">
          <h2 className="text-lg font-bold tracking-tight">Switch Identity</h2>
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Select the account type for your universe.</p>
        </div>

        <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as AccountType)} className="gap-3">
          {(Object.keys(accountTypeDescriptions) as AccountType[]).map((type) => (
            <Label 
              key={type} 
              htmlFor={type}
              className={cn(
                "flex items-center space-x-3 space-y-0 rounded-xl border-2 p-3.5 transition-all cursor-pointer active:scale-[0.98]",
                selectedType === type ? "bg-primary/5 border-primary shadow-sm" : "border-border hover:bg-accent/50"
              )}
            >
              <RadioGroupItem value={type} id={type} className="h-4 w-4" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{accountTypeLabels[type]}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{accountTypeDescriptions[type]}</div>
              </div>
            </Label>
          ))}
        </RadioGroup>

        <div className="mt-8 space-y-2">
          <Button 
            className="w-full h-10 text-xs font-bold rounded-xl shadow-lg shadow-primary/20" 
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-10 text-xs font-bold text-muted-foreground" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </main>
    </div>
  );
}
