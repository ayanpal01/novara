import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
      <SignIn />
    </div>
  );
}
