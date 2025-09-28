import { useState } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Package,
  ArrowLeft 
} from "lucide-react"
import { Link } from "react-router-dom"

interface PickupSchedule {
  id: string
  date: string
  time: string
  location: string
  status: "scheduled" | "in-progress" | "completed" | "missed"
  notes?: string
}

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>()
  
  // Mock data - in real app this would come from your backend
  const [schedules, setSchedules] = useState<PickupSchedule[]>([
    {
      id: "1",
      date: "2024-01-15",
      time: "7:00 PM",
      location: "Building A - Floors 1-5",
      status: "completed",
      notes: "All units serviced successfully"
    },
    {
      id: "2", 
      date: "2024-01-16",
      time: "7:30 PM",
      location: "Building B - Floors 1-8",
      status: "scheduled"
    },
    {
      id: "3",
      date: "2024-01-17",
      time: "8:00 PM", 
      location: "Building A - Floors 6-10",
      status: "in-progress",
      notes: "Currently servicing floors 6-7"
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "scheduled": return "bg-gray-100 text-gray-800"
      case "missed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />
      case "in-progress": return <Clock className="w-4 h-4" />
      case "scheduled": return <CalendarIcon className="w-4 h-4" />
      case "missed": return <AlertCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-luxury-navy hover:text-luxury-gold transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
                  <span className="text-luxury-navy font-bold text-sm">EV</span>
                </div>
                <span className="text-xl font-bold text-luxury-navy">EliteValet Scheduling</span>
              </div>
            </div>
            <Button variant="gold" size="sm">Contact Us</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Calendar & Quick Stats */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-luxury-navy mb-4">Pickup Calendar</h3>
              <EnhancedCalendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto"
                enableYearDropdown={true}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-luxury-navy mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge className="bg-green-100 text-green-800">5</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <Badge className="bg-blue-100 text-blue-800">1</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Schedule List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-luxury-navy">Pickup Schedule</h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Filter by date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <EnhancedCalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
                    enableYearDropdown={true}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="p-6 hover:shadow-elegant transition-shadow duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge className={cn("flex items-center space-x-1", getStatusColor(schedule.status))}>
                          {getStatusIcon(schedule.status)}
                          <span className="capitalize">{schedule.status.replace("-", " ")}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">{schedule.date}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-luxury-navy mb-2">
                        {schedule.location}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{schedule.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{schedule.location}</span>
                        </div>
                      </div>
                      
                      {schedule.notes && (
                        <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                          {schedule.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {schedule.status === "scheduled" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSchedules(schedules.map(s => 
                              s.id === schedule.id 
                                ? { ...s, status: "in-progress", notes: "Service has begun" }
                                : s
                            ))
                          }}
                        >
                          Start Service
                        </Button>
                      )}
                      {schedule.status === "in-progress" && (
                        <Button 
                          variant="premium" 
                          size="sm"
                          onClick={() => {
                            setSchedules(schedules.map(s => 
                              s.id === schedule.id 
                                ? { ...s, status: "completed", notes: "Service completed successfully" }
                                : s
                            ))
                          }}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add New Schedule */}
            <Card className="p-6 border-dashed border-2 border-luxury-gold/30 bg-luxury-gold/5">
              <div className="text-center">
                <Package className="w-12 h-12 text-luxury-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-luxury-navy mb-2">Contact for New Schedule</h3>
                <p className="text-muted-foreground mb-4">Need to add or modify your pickup schedule? Get in touch with us</p>
                <Button variant="gold">Contact EliteValet</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard