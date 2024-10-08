"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";

const AppConnectionHandler = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    const { publicKey } = useWallet();

    return (
    <React.Fragment>
        {publicKey ? 
            children
        : 
        (
        <div className="w-full h-screen flex flex-col items-center justify-center gap-3">
            <span className="font-bold">
                Awaiting Wallet Connection...
            </span>
        </div>
        )}
    </React.Fragment>
    )
}

export default AppConnectionHandler