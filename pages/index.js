import { useUser } from "@auth0/nextjs-auth0/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const { isLoading, error, user } = useUser();
  const router = useRouter();

  // Automatically redirect to /chat if the user is authenticated
  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);

  if (isLoading) return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-gray-800 text-center text-white">
      Loading...
    </div>
  );
  if (error) return <div>{error.message}</div>;

  return (
    <>
      <Head>
        <title>Chatty pete - Login or Signup</title>
      </Head>
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-gray-800 text-center text-white">
        <div className="flex flex-col items-center ">
          <Image
            src={"/robot-img.png"}
            width={100}
            height={100}
            alt="user avatar"
          />
          <h1 className="font-inter mb-3 text-4xl font-bold">
            Welcome to Chatty Cherry
          </h1>
          <p>Log in with your account to continue</p>
        </div>
        <div className="flex gap-6">
          {!!user && (
            <Link href={"/api/auth/logout"} className="btn">
              Log out
            </Link>
          )}
          {!user && (
            <>
              <Link href={"/api/auth/login"} className="btn">
                Log in
              </Link>
              <Link href={"/api/auth/signup"} className="btn">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
