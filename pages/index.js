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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <>
      <Head>
        <title>Chatty pete - Login or Signup</title>
      </Head>
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-gray-800 text-center text-white">
        <Image
          src={"/robot-img.png"}
          width={100}
          height={100}
          alt="user avatar"
        />
        <h1 className="font-inter text-4xl font-bold">Chatty Cherry</h1>
        <div className="flex gap-6">
          {!!user && <Link href={"/api/auth/logout"}>Logout</Link>}
          {!user && (
            <>
              <Link href={"/api/auth/login"} className="btn">
                Login
              </Link>
              <Link href={"/api/auth/signup"} className="btn">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
