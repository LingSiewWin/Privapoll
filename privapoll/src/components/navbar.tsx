'use client'
import dynamic from 'next/dynamic';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React from 'react'


const Navbar = () => {
    const router = useRouter();

    const WalletMultiButtonDynamic = dynamic(
        () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
        { ssr: false }
      );

    return (
        <nav className="z-10 px-10 top-0 w-full h-[100px] flex justify-between items-center absolute bg-black bg-opacity-55">
            <div className='cursor-pointer' onClick={() => router.push('/welcome')}>
                <Image src="/privapoll.svg" alt='logo' width={200} height={50} />
            </div>
            <WalletMultiButtonDynamic />
        </nav>
    )
}

export default Navbar