'use client'
import Header from "@/components/Header";
import Head from "next/head";
import Image from "next/image";
import { useAddress, useContract, useContractWrite} from '@thirdweb-dev/react'
import Login from '../components/Login'
import Loading from "./Loading";
import {  useContractRead } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { ethers } from 'ethers'
import { currency } from "@/constants";
import CountdownTimer from "@/components/CountdownTimer";
import toast from "react-hot-toast"
import Marquee from "react-fast-marquee";
import AdminControls from "@/components/AdminControls";

export default  function Home() {
  const address = useAddress()
  const { contract, isLoading } = useContract(process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS)
  const { data : remainingTickets } = useContractRead(contract, "RemainingTickets")
  const { data : pricePerTicket} = useContractRead(contract, "CurrentWinningReward")
  const { mutateAsync: BuyTickets} = useContractWrite(contract, "BuyTickets")
  const { mutateAsync: WithdrawWinnings} = useContractWrite(contract, "WithdrawWinnings")
  const { data : ticketPrice} = useContractRead(contract, "ticketPrice")
  const { data: ticketCommission } = useContractRead(contract, "ticketCommission")
  const { data:expiration} = useContractRead(contract, "expiration")
  const { data :tickets} = useContractRead(contract, "getTickets")
  const { data:lastwinner} = useContractRead(contract, "lastWinner")
  const { data:lastwinnerAmount } = useContractRead(contract, "lastWinnerAmount")
  const { data: lotteryOperator} = useContractRead(contract, "lotteryOperator")
  const [userTickets, setUserTickets] = useState(0) 

  
  const handlePurchase = async () => {
    if (!ticketPrice) return
    const notification = toast.loading("Buying your tickets... 🎫")
    
    try {
        const data = await BuyTickets({
          args: [
            {
              value: ethers.utils.parseEther(
                (Number(ethers.utils.formatEther(ticketPrice)) * quantity).toString()
              ),
            },
          ],
        });
      toast.success("Ticket purchased!", { id: notification })
      console.log("Contract call success.")

    } catch (error) {
      toast.error("Error purchasing ticket", { id: notification })
      console.log("Contract call failed.", error)
    }
  }
  
  
  useEffect(() => {
    if (!tickets) return
    const totalTickets: string[] = tickets
    const numOfUserTickets = totalTickets.reduce((total, ticketAddress) =>
      (ticketAddress === address) ? total + 1 : total, 0)

    setUserTickets(numOfUserTickets)
  }, [tickets, address])
  
  const { data: winnings } =   useContractRead(contract,"getWinningsForAddress")
  const [quantity, setQuantity] = useState<number>(1);
  
  if (!address)  return  <Login/>
  if (isLoading) return <Loading />



  const handleWithdraw = async () => {
    const notification = toast.loading("Withdrawing your winnings... 🎫");
  
    try {
      const data = await WithdrawWinnings({});
  
      toast.success("Winnings withdrawn!", { id: notification });
      console.log("Contract call success.");
    } catch (error) {
      toast.error("Error withdrawing winnings", { id: notification });
      console.log("Contract call failed.", error);
    }
  };
  
  return (
      <div  className="bg-[#091b18] min-h-screen flex flex-col">
        <Head>
          <title>
            jk
          </title>
        </Head>
         <Header />

         {/* <Marquee className="bg-[#0A1F1C] p-5 mb-5 " gradient={false} speed={100} >
         <h4 className="text-white font-bold ">Last Winner:{lastwinner?.toString()} {"    "}</h4>
         
         <h4> previous winning: {lastwinnerAmount && ethers.utils.formatEther(lastwinnerAmount?.toString())}{"      "}
         {currency}
         
         </h4>
        </Marquee> */}
        <Marquee className="bg-[#0A1F1C] p-5 mb-5" gradient={false} speed={100} >
          <div className='space-x-8 flex mx-10'>
            <h4 className='text-white font-bold'>Last Winner: {lastwinner?.toString()}
            </h4>
            <h4 className='text-white font-bold'> previous winning: {lastwinnerAmount && ethers.utils.formatEther(lastwinnerAmount?.toString())}</h4>
           </div>
        </Marquee>

         {winnings > 0 && (
          <div className='max-w-md md:max-w-2xl lg:max-w-4xl mx-auto mt-5'>
            <button  onClick={handleWithdraw} className='p-5 bg-gradient-to-br
              from-orange-500 to-emerald-600 animate-pulse text-center rounded-xl w-full '>
              <p className='font-bold'>Winner Winner Chicken Dinner!</p>
              <p>Total winnings: {ethers.utils.formatEther(winnings.toString())}{"    "}{currency}</p>
              <br />
              <p>Click here to withdraw 💸</p>
            </button>
          </div>
        )}

        {lotteryOperator === address  && (
          <div className="flex justify-center">
            <AdminControls />
          </div>
          )}

         <div className='space-y-5 md:space-y-0 m-5 md:flex items-start justify-center md:space-x-5'>
          <div className='stats-container'>
            <h1 className='text-5xl text-white font-semibold text-center'>The Next Draw</h1>
            <div className='flex justify-between p-2 space-x-2'>
              <div className='stats'>
                <h2 className='text-sm'>Total Pool</h2>
                <p className='text-xl'>
                  {pricePerTicket && ethers.utils.formatEther(pricePerTicket.toString())}{" "}{currency}
                </p>
              </div>
              <div className='stats'>
                <h2 className='text-sm'>Tickets Remaining</h2>
                <p className='text-xl'> {remainingTickets?.toNumber()}</p>
               
              </div>
            </div>
          
            <div className='mt-5 mb-3'>
              <CountdownTimer/>
            </div>
          </div>
          <div className='stats-container space-y-2'>
            <div className='stats-container'>
              <div className="flex justify-between items-center text-white pb-2">
                <h2>Price per ticket</h2>
                <p>
                  {ticketPrice && ethers.utils.formatEther(ticketPrice.toString())}{" "}{currency}
                </p>
              </div>
              <div className='flex text-white items-center space-x-2 bg-[#091b18] border-[#004337] border p-4'>
                <p>Tickets</p>
                <input onChange={(e) => setQuantity(Number(e.target.value))} value={quantity} placeholder='select quantity' className='flex w-full bg-transparent text-right outline-none' min={1} type="number" />
              </div>

              <div className='space-y-2 mt-5'>
                <div className='flex items-center font-extrabold justify-between text-emerald-300 text-sm italic'>
                  <p>Total cost of tickets</p>
                  <p>
                    {ticketPrice && Number(ethers.utils.formatEther(ticketPrice.toString())) * quantity}{" "}{currency}
                  </p>
                </div>
                <div className='flex items-center justify-between text-emerald-300 text-xs italic'>
                  <p>Service fees</p>
                  <p>
                    {ticketCommission && ethers.utils.formatEther(ticketCommission.toString())}{" "}{currency}
                  </p>
                </div>
                <div className='flex items-center justify-between text-emerald-300 text-xs italic'>
                  <p>+ Network fees</p>
                  <p>TBD</p>
                </div>
              </div>
              <button  onClick={handlePurchase} disabled={expiration?.toString() < Date.now().toString() || remainingTickets?.toNumber() === 0}
              className='mt-4 w-full bg-gradient-to-br
              from-orange-500 to-emerald-600 px-10 py-5 rounded-md
              text-white shadow-xl disabled:from-gray-600
              disabled:text-gray-100 disabled:to-gray-600 
               disabled:cursor-not-allowed font-semibold' > 
                Buy {quantity} tickets for{" "}
                {ticketPrice && Number(ethers.utils.formatEther(ticketPrice.toString())) * quantity}{" "}{currency}
              </button>
            </div>
            {userTickets > 0 && (
              <div className='stats'>
                <p className='text-lg mb-2'>You have {userTickets} tickets in this draw</p>
                <div className='flex max-w-sm flex-wrap gap-x-2 gap-y-2'>
                  {
                    Array(userTickets).fill("").map(
                      (_, index) => (<p key={index} className="text-emerald-300 h-20 w-12 bg-emerald-500/30 rounded-lg flex flex-shrink-0 items-center justify-center text-xs italic">{index + 1}</p>
                      ))}
                </div>
              </div>
            )}
            </div>
            
        </div>

      </div>      
  );
}
