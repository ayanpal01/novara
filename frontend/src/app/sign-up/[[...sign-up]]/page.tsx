import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
      <SignUp />
    </div>
  );
}
