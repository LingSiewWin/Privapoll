"use client";
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FlickeringGrid from '@/components/ui/flickering-grid';
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { Idl, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import { AnchorProvider, getProvider, Program, setProvider, web3 } from'@project-serum/anchor';


const PROGRAM_ID = new PublicKey("cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ");

export default function CreateVotingTopic() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['']);
  const [deadline, setDeadline] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [votingTarget, setVotingTarget] = useState(true);
  const [createEventProgram, setCreateEventProgram] = useState<Program | null>(null);
  const { connection } = useConnection();
  const devnetConnection = new Connection("https://api.devnet.solana.com");
  const { publicKey, sendTransaction } = useWallet();
  const router = useRouter();
  const wallet = useAnchorWallet();

  if (!wallet || !publicKey) {
    throw new Error("Invalid Wallet")
  }
  // const connection = new solana.Connection(solana.clusterApiUrl('mainnet-beta'))
  // const keypair = anchor.web3.Keypair.generate()
  // const provider = new anchor.AnchorProvider(connection, wallet)
  // const candyMachineV2Program = new solana.PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');
  // const idl = await anchor.Program.fetchIdl(candyMachineV2Program, provider);
  // const program = new anchor.Program(idl, candyMachineV2Program, provider);
  // const accounts = await program.account.candyMachine.fetch('9tQLFyLeaUwQ1PN2YDiFztZDxu4KT6px8CBYEapkshAD')
  // console.log(accounts)
  useEffect(() => {
    const fetchSolIdl = async () => {
      // Set up the provider inside the effect
      const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
      console.log("Provider", provider);
      setProvider(provider);

      try {
        const fetchedIdl = await Program.fetchIdl(PROGRAM_ID, provider);
        console.log("Fetched IDL", fetchedIdl);

        // Only set the program if the IDL is successfully fetched
        if (fetchedIdl) {
          const program = new Program(fetchedIdl, PROGRAM_ID, provider);
          console.log("Program initialized:", program);
          setCreateEventProgram(program);
        } else {
          console.error("Failed to fetch IDL");
        }
      } catch (error) {
        console.error("Error fetching IDL or initializing program:", error);
      }
    }
    fetchSolIdl();
  }, [connection, wallet]); // Only run when connection or wallet changes

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const filteredOptions = options.filter(opt => opt.trim() !== '');
    const newTopic = {
      id: Date.now(), // Generate a new ID
      title,
      description,
      options: filteredOptions,
      deadline,
      isPublic,
      votingTarget,
    };

    // Get existing topics and votes from localStorage
    const existingTopics = JSON.parse(localStorage.getItem('votingTopics') || '[]');
    const existingVotes = JSON.parse(localStorage.getItem('votingVotes') || '{}');

    // Initialize votes for the new topic
    const newVotes = {
      ...existingVotes,
      [newTopic.id]: filteredOptions.reduce((acc, option) => {
        acc[option] = 0;
        return acc;
      }, {} as { [key: string]: number })
    };

    // Update localStorage
    localStorage.setItem('votingTopics', JSON.stringify([...existingTopics, newTopic]));
    localStorage.setItem('votingVotes', JSON.stringify(newVotes));

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey("J2327EQrj4fiGu3A1Fm93KMR6DKWVdccqPz2P5aZxPKo"),
        lamports: web3.LAMPORTS_PER_SOL / 10000, // Sending 0.01 SOL
      })
    );

    // Send and confirm the transaction
    try {
      const signature = await sendTransaction(transaction, devnetConnection);
      alert('Vote created successfully on the blockchain!');

      console.log('Transaction signature', signature);
    } catch (error) {
      console.error('Transaction failed', error);
    }
};

  return (
    <div className="min-h-screen bg-background text-white p-6 justify-center items-center flex flex-col w-full">
      <FlickeringGrid
        className="z-0 absolute inset-0 size-full"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.1}
      />
      <div className='bg-black z-10 p-10 rounded-xl bg-opacity-70 border border-zinc-700'>
        <button className="mb-6 flex items-center text-gray-400 hover:text-gray-300"
          onClick={() => {
            router.back();
          }}>
          <ArrowLeft className="mr-2" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-6">Create a New Voting Topic</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block mb-2">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="deadline" className="block mb-2">Voting Deadline</label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Visibility</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="public"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="mr-2"
                />
                Public
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="private"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="mr-2"
                />
                Private
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-2">Exclusive for high humanity user?</label>
            <div className='flex space-x-4 gap-3'>
                <label className="flex items-center">
                    <input
                        type='radio'
                        value="Yes"
                        onChange={() => setVotingTarget(true)}
                        checked={votingTarget}
                        className="mr-2"
                    />
                    Yes
                </label>
                <label className="flex items-center">
                    <input
                        type='radio'
                        value="No"
                        onChange={() => setVotingTarget(false)}
                        checked={!votingTarget}
                        className="mr-2"
                    />
                    No
                </label>
            </div>
            
            
          </div>

          <div>
            <label className="block mb-2">Vote Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-grow p-2 bg-gray-800 rounded-l"
                  placeholder={`Option ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="bg-red-600 p-2 rounded-r"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 flex items-center text-green-400 hover:text-green-300"
            >
              <Plus size={20} className="mr-2" />
              Add Option
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded font-bold"
          >
            Create Topic
          </button>
        </form>
      </div>
    </div>
  );
}