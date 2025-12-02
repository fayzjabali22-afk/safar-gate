
'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase, useDoc, setDocumentNonBlocking, useAuth } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { deleteUser, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Trash2, MailCheck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { actionCodeSettings } from '@/firebase/config';


const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);


  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || user?.email || '',
        phoneNumber: userProfile.phoneNumber || user?.phoneNumber || ''
      });
    } else if (user) {
        form.reset({
        ...form.getValues(),
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
        });
    }
  }, [userProfile, user, form]);
  
  function onSubmit(data: ProfileFormValues) {
    if (!userProfileRef) return;
    
    setDocumentNonBlocking(userProfileRef, data, { merge: true });

    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    });
  }

  const handleResendVerification = async () => {
    if (user && !user.emailVerified) {
        try {
            await sendEmailVerification(user, actionCodeSettings);
            toast({
                title: 'Email Sent',
                description: 'A new verification email has been sent. Please check your inbox.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to send verification email. Please try again shortly.',
            });
        }
    }
  };

    const handleDeleteAccount = async () => {
    if (!user || !auth || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'User or Firebase services not found.' });
        setIsDeleteConfirmOpen(false);
        return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);

    try {
        await deleteDoc(userDocRef);
        toast({ title: 'Firestore Profile Deleted', description: 'Your profile has been removed from the database.' });

        await deleteUser(user);
        
        toast({ title: 'Account Deleted Successfully', description: 'We hope to see you again soon.' });
        router.push('/signup');

    } catch (error: any) {
        console.error("Delete account error:", error);
        
        if (error.code === 'auth/requires-recent-login') {
            toast({
                variant: 'destructive',
                title: 'Authentication Deletion Failed',
                description: 'This operation requires a recent login. Your data has been deleted, please log out and log back in to complete deletion.',
            });
             router.push('/login'); 
        } else {
             toast({
                variant: 'destructive',
                title: 'Failed to Delete Account',
                description: 'An error occurred while trying to delete your account.',
            });
        }
    } finally {
        setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <>
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        
        {user && !user.emailVerified && (
          <Card className="border-yellow-500 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                    <ShieldAlert />
                    Account Verification
                </CardTitle>
                <CardDescription>
                    Your account is not verified. Please check your email or request a new verification link.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button variant="outline" onClick={handleResendVerification}>
                    <MailCheck className="mr-2 h-4 w-4" />
                    Resend Verification Email
                </Button>
            </CardFooter>
          </Card>
        )}

        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="font-headline">Profile Settings</CardTitle>
            <CardDescription>
                Manage your account information and preferences.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20">
                    {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
                    <AvatarFallback>
                        {userProfile?.firstName ? userProfile.firstName.charAt(0) : user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" type="button">Change Photo</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="Your email" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                        <Input type="tel" placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit">Save Changes</Button>
                </form>
            </Form>
            </CardContent>
        </Card>

        <Card className="border-destructive shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert />
                    Danger Zone
                </CardTitle>
                <CardDescription>
                    These actions are permanent and cannot be undone. Please proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Once you delete your account, you will lose all your personal data and booking history permanently.</p>
            </CardContent>
            <CardFooter>
                 <Button variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account Permanently
                </Button>
            </CardFooter>
        </Card>
      </div>
    </AppLayout>

    <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-red-500" />
                    Are you sure you want to delete your account?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This action will permanently delete your account. This cannot be undone. All your personal data, bookings, and trip history will be erased.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, delete my account
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
