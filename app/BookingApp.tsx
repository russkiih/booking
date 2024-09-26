"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { db } from "@/lib/firebaseConfig"; // Adjust the import path as necessary
import { collection, addDoc } from "firebase/firestore";

export default function BookingApp() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string | undefined>(undefined)
  const [service, setService] = useState<string>("haircut")
  const [step, setStep] = useState<'booking' | 'personal-info'>('booking')
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const services = [
    {
      id: "haircut",
      name: "Haircut",
      description: "Professional haircut and styling",
      duration: "1 hour",
    },
    {
      id: "coloring",
      name: "Hair Coloring",
      description: "Full hair coloring service",
      duration: "2 hours",
    },
    {
      id: "hair extensions",
      name: "Hair Extensions",
      description: "Professional hair extensions",
      duration: "5 hours",
    },
    {
      id: "treatment",
      name: "Hair Treatment",
      description: "Rejuvenating hair care",
      duration: "2 hour",
    },
  ]

  const disabledDays = { before: new Date() }

  const timeSlots = [
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
    "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"
  ]

  const handleServiceChange = (value: string) => {
    setService(value)
    if (value !== "coloring" || time !== "4:00 PM") {
      setTime(undefined)
    }
  }

  const handleTimeChange = (value: string) => {
    setTime(value)
    if (service === "coloring" && value === "4:00 PM") {
      // Force re-render of time slots
      setService("coloring")
    }
  }

  const handleConfirmBooking = () => {
    if (!date || !time || !service) {
      toast.error("Please select a date, time, and service before confirming.")
      return
    }
    setStep('personal-info')
  }

  const handleBook = async () => {
    if (!name || !email || !phone) {
      toast.error("Please fill in all personal information fields.")
      return
    }

    // Validate phone number (you may want to use a more robust validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Please enter a valid phone number.")
      return
    }

    const bookingData = { service, date, time, name, email, phone }

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        // If the response status is not in the 200-299 range, throw an error
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Response:', response)
      console.log('Response Data:', data)

      // Store client information in Firestore
      await addDoc(collection(db, "clients"), {
        service,
        date,
        time,
        name,
        email,
        phone,
      });

      toast.success("Your appointment has been successfully booked. Check your email and phone for confirmation.")
      if (data.previewUrl) {
        console.log('Email preview:', data.previewUrl)
      }
      // Reset the form or navigate to a confirmation page
      setStep('booking')
      setDate(undefined)
      setTime(undefined)
      setService("haircut")
      setName("")
      setEmail("")
      setPhone("")
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error(`There was an error booking your appointment: ${error.message}`)
    }
  }

  if (step === 'personal-info') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Personal Information</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={handleBook}>BOOK</Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-8">
      <center><h1 className="text-3xl font-bold">Meet with Rusalina</h1></center>
      
      <Card>
        <CardHeader>
          <center><CardTitle>Select a Service</CardTitle></center>
        </CardHeader>
        <CardContent>
          <RadioGroup value={service} onValueChange={handleServiceChange}>
            {services.map((s) => (
              <div key={s.id} className="flex items-start space-x-2 mb-4">
                <RadioGroupItem value={s.id} id={s.id} className="mt-1" />
                <Label htmlFor={s.id} className="flex-grow">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                    <p className="text-sm text-muted-foreground">Duration: {s.duration}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <center><CardTitle>Select a Date</CardTitle></center>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={disabledDays}
            defaultMonth={new Date(new Date().setDate(new Date().getDate() + 1))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <center><CardTitle>Select a Time</CardTitle></center>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot}
                variant={time === slot ? "default" : "outline"}
                onClick={() => handleTimeChange(slot)}
                className="w-full"
              >
                {slot}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" disabled={!date || !time} onClick={handleConfirmBooking}>
        Confirm Booking
      </Button>
    </div>
  )
}