import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

const galleryItems = [
  {
    id: 1,
    title: "Martian Sunset",
    model: "Kling",
    date: "2025-06-22",
    tags: ["sci-fi", "space"],
    thumbnailUrl: "/placeholder.svg?height=256&width=256",
  },
  {
    id: 2,
    title: "Cyberpunk Alleyway",
    model: "Luma",
    date: "2025-06-21",
    tags: ["cyberpunk", "dystopian"],
    thumbnailUrl: "/placeholder.svg?height=256&width=256",
  },
  {
    id: 3,
    title: "Enchanted Forest",
    model: "Runway",
    date: "2025-06-20",
    tags: ["fantasy", "nature"],
    thumbnailUrl: "/placeholder.svg?height=256&width=256",
  },
  {
    id: 4,
    title: "Oceanic Wonders",
    model: "Kling",
    date: "2025-06-19",
    tags: ["ocean", "documentary"],
    thumbnailUrl: "/placeholder.svg?height=256&width=256",
  },
]

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Project Gallery</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
          <Input placeholder="Search by prompt or tags..." className="pl-10 bg-transparent border-neutral-700" />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-[180px] bg-transparent border-neutral-700">
            <SelectValue placeholder="Filter by Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kling">Kling</SelectItem>
            <SelectItem value="luma">Luma</SelectItem>
            <SelectItem value="runway">Runway</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-[180px] bg-transparent border-neutral-700">
            <SelectValue placeholder="Sort by Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {galleryItems.map((item) => (
          <Card key={item.id} className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden group">
            <CardContent className="p-0">
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.thumbnailUrl || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{item.title}</h3>
                <p className="text-sm text-neutral-400">Model: {item.model}</p>
                <p className="text-sm text-neutral-500">{item.date}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
