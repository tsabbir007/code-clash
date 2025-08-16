"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { showErrorToast, showSuccessToast } from "@/lib/utils";

export default function UserInfo() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { data: session } = authClient.useSession()

  console.log(session)

  const onSignIn = async () => {
    await authClient.signIn.email({
      email,
      password
    })
  }


  const onSubmit = async () => {
    await authClient.signUp.email({
      email,
      password,
      name
    }, {
      onError: () => {
        showErrorToast("Something went wrong")
      },
      onSuccess: () => {
        showSuccessToast("Signed up successfully")
      }
    })
  }

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user.name}</p>
        <p>IP Address: {session.session.ipAddress}</p>
        <p>User Agent: {session.session.userAgent}</p>
        <p>Token: {session.session.token}</p>

        <Button className="cursor-pointer" onClick={() => authClient.signOut()}>Sign Out</Button>
      </div>
    )
  }

  return null;


  return (
    <div className="flex flex-col gap-4 p-6 h-screen justify-center items-center !w-full">
      <div className="flex flex-col gap-4">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={onSignIn}>Sign In</Button>
      </div>
      <div className="flex flex-col gap-4">
        <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={onSubmit}>Sign Up</Button>
      </div>
    </div>
  );
}
